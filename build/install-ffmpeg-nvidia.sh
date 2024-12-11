#!/bin/bash
#
# adapted from https://gist.github.com/bilalmughal/cb89936bc947fa727a8ec66e3ddf768a
#
# https://www.nvidia.com/en-us/drivers/
# https://developer.nvidia.com/cuda-downloads
# https://developer.nvidia.com/cudnn-downloads?target_os=Linux

set -e # Exit on any error

if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root."
    exit 1
fi

DOWNLOAD="wget"
USR_LOCAL_PREFIX="/usr/local"
CUDA_HOME=$USR_LOCAL_PREFIX/cuda
HOME_DIR=$HOME
SRC_DIR=$HOME_DIR/sources

CPUS=$(nproc)
LOG_FILE="$HOME_DIR/install.log"
LOCAL_TMP="$HOME_DIR/sources/local-tmp"
mkdir -p $LOCAL_TMP

if [[ "$1" != "--stdout" ]]; then
    exec >>"$LOG_FILE" 2>&1
fi
if lspci | grep -i "NVIDIA Corporation" >/dev/null; then
    echo "System has a GPU"
    HAS_GPU="true"
fi

OPUS_VER="opus-1.4"
LIBAOM_VER="v3.7.0"
LIBOGG_VER="libogg-1.3.5"
LIBVORBIS_VER="libvorbis-1.3.7"
LIBASS_URL=$(curl -s "https://api.github.com/repos/libass/libass/releases/latest" | awk -F'"' '/browser_download_url.*.tar.gz"/{print $4}')

# Create source directory
mkdir -p $SRC_DIR
pushd $SRC_DIR

# Helper functionS to check installation status
check_installation() {
    if [ -f "$1" ]; then
        echo "Success : $2 Installed"
    else
        echo "Error : $2 Installation Failed"
        echo "Exiting script due to installation failure."
        exit 1
    fi
}

# Helper function to check installation based on exit code
check_exit_code() {
    if [ $1 -eq 0 ]; then
        echo "Success : $2 Installed"
    else
        echo "Error : $2 Installation Failed (Exit Code: $1)"
        echo "Exiting script due to installation failure."
        exit 1
    fi
}
# Utility function to push a wildcard
pushdw() {
    pushd "$(find $HOME_DIR -type d -name "$1" | head -n 1)"
}

# Install system utilities and updates
install_utils() {
    if [ -n "$(command -v dnf)" ]; then
        package_manager="dnf"
    elif [ -n "$(command -v apt)" ]; then
        package_manager="apt"
    else
        echo "Neither DNF nor APT package manager found. Exiting."
        exit 1
    fi

    echo "Updating packages..."
    $package_manager -y update

    echo "Installing packages..."
    if [ "$package_manager" = "dnf" ]; then
        $package_manager -y groupinstall "Development Tools"
        $package_manager install -y git autoconf kernel-modules-extra openssl-devel cmake3 htop iotop yasm nasm jq freetype-devel fribidi-devel harfbuzz-devel fontconfig-devel bzip2-devel
    elif [ "$package_manager" = "apt" ]; then
        export DEBIAN_FRONTEND=noninteractive
        export NEEDRESTART_MODE=a
        $package_manager install -y build-essential git autoconf libtool libssl-dev cmake htop iotop yasm nasm jq libfreetype6-dev libfribidi-dev libharfbuzz-dev libfontconfig1-dev libbz2-dev
    fi

    echo "Success: Updates and packages installed."

    echo "$USR_LOCAL_PREFIX/lib" | sudo tee /etc/ld.so.conf.d/usr-local-lib.conf
    echo "$USR_LOCAL_PREFIX/lib64" | sudo tee -a /etc/ld.so.conf.d/usr-local-lib.conf
    ldconfig
}

# Setup GPU, CUDA and CUDNN
setup_gpu() {
    if [ "$HAS_GPU" != "true" ]; then
        echo "Skipping GPU installation"
        return 0
    fi
    if [ "$(uname -m)" = "aarch64" ]; then
        echo "System is running on ARM / AArch64"
        DRIVE_URL="https://us.download.nvidia.com/tesla/550.127.08/NVIDIA-Linux-aarch64-550.127.08.run"
        CUDA_SDK_URL="https://developer.download.nvidia.com/compute/cuda/12.6.3/local_installers/cuda_12.6.3_560.35.05_linux_sbsa.run"
        CUDNN_ARCHIVE_URL="https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-sbsa/cudnn-linux-sbsa-9.6.0.74_cuda12-archive.tar.xz"
    else
        DRIVE_URL="https://us.download.nvidia.com/tesla/550.127.08/NVIDIA-Linux-x86_64-550.127.08.run"
        CUDA_SDK_URL="https://developer.download.nvidia.com/compute/cuda/12.6.3/local_installers/cuda_12.6.3_560.35.05_linux.run"
        CUDNN_ARCHIVE_URL="https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-x86_64/cudnn-linux-x86_64-9.6.0.74_cuda12-archive.tar.xz"
    fi

    echo "Setting up GPU..."
    DRIVER_NAME="NVIDIA-Linux-driver.run"
    wget -O "$DRIVER_NAME" "$DRIVE_URL"
    TMPDIR=$LOCAL_TMP sh "$DRIVER_NAME" --disable-nouveau --silent

    CUDA_SDK="cuda-linux.run"
    wget -O "$CUDA_SDK" "$CUDA_SDK_URL"
    TMPDIR=$LOCAL_TMP sh "$CUDA_SDK" --silent --override --toolkit --samples --toolkitpath=$USR_LOCAL_PREFIX/cuda-12.2 --samplespath=$CUDA_HOME --no-opengl-libs

    CUDNN_ARCHIVE="cudnn-linux.tar.xz"
    EXTRACT_PATH="$SRC_DIR/cudnn-extracted"
    mkdir -p "$EXTRACT_PATH"

    wget -O "$CUDNN_ARCHIVE" "$CUDNN_ARCHIVE_URL"
    tar -xJf "$CUDNN_ARCHIVE" -C "$EXTRACT_PATH"
    CUDNN_INCLUDE=$(find "$EXTRACT_PATH" -type d -name "include" -print -quit)
    CUDNN_LIB=$(find "$EXTRACT_PATH" -type d -name "lib" -print -quit)
    cp -P "$CUDNN_INCLUDE"/* $CUDA_HOME/include/
    cp -P "$CUDNN_LIB"/* $CUDA_HOME/lib64/
    chmod a+r $CUDA_HOME/lib64/*
    ldconfig
    rm -fr cu* NVIDIA*
}

install_ffmpeg_prereqs() {
    # Install LIBAOM (AV1 Codec Library)
    mkdir -p libaom &&
        pushd libaom &&
        git -c advice.detachedHead=false clone --depth 1 --branch $LIBAOM_VER https://aomedia.googlesource.com/aom &&
        cmake \
            -DBUILD_SHARED_LIBS=ON \
            -DENABLE_DOCS=OFF \
            -DCMAKE_INSTALL_LIBDIR=lib \
            -DCMAKE_INSTALL_PREFIX:PATH=$USR_LOCAL_PREFIX ./aom &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libaom.so" "LIBAOM"

    if [ "$HAS_GPU" == "true" ]; then
        # Install ffnvcodec FFmpeg with NVIDIA GPU acceleration
        git clone https://git.videolan.org/git/ffmpeg/nv-codec-headers.git &&
            pushd nv-codec-headers &&
            sudo make install PREFIX="$USR_LOCAL_PREFIX"
        popd
        check_installation "$USR_LOCAL_PREFIX/include/ffnvcodec/nvEncodeAPI.h" "Nvidia ffnvcodec"
    fi

    # Install LIBASS (portable subtitle renderer)
    $DOWNLOAD ${LIBASS_URL} &&
        tar -zxf libass*.tar.gz &&
        pushdw "libass*" &&
        ./configure --prefix="$USR_LOCAL_PREFIX" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libass.so" "LIBASS"

    # Install libmp3lame (MP3 Encoder)
    curl -L https://sourceforge.net/projects/lame/files/latest/download -o lame.tar.gz &&
        tar xzvf lame.tar.gz &&
        pushdw "lame*" &&
        ./configure --prefix="$USR_LOCAL_PREFIX" \
            --bindir="/usr/bin" \
            --enable-nasm &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libmp3lame.so" "libmp3lame"

    # Install opus video codec
    $DOWNLOAD https://ftp.osuosl.org/pub/xiph/releases/opus/$OPUS_VER.tar.gz &&
        tar xzvf $OPUS_VER.tar.gz &&
        pushd $OPUS_VER &&
        ./configure --prefix="$USR_LOCAL_PREFIX" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libopus.so" "opus"

    # Install libogg (OGG Container format)
    $DOWNLOAD http://downloads.xiph.org/releases/ogg/$LIBOGG_VER.tar.gz &&
        tar xzvf $LIBOGG_VER.tar.gz &&
        pushd $LIBOGG_VER &&
        ./configure --prefix="$USR_LOCAL_PREFIX" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libogg.so" "libogg"
    ldconfig

    # Install libvorbis (vorbis audio codec)
    $DOWNLOAD http://downloads.xiph.org/releases/vorbis/$LIBVORBIS_VER.tar.gz &&
        tar xzvf $LIBVORBIS_VER.tar.gz &&
        pushd $LIBVORBIS_VER &&
        ./configure --prefix="$USR_LOCAL_PREFIX" \
            --with-ogg="$USR_LOCAL_PREFIX" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libvorbis.so" "libvorbis"

    # Install FDKAAC (AAC audio codec)
    git clone --depth 1 https://github.com/mstorsjo/fdk-aac &&
        pushd fdk-aac &&
        autoreconf -fiv &&
        ./configure --prefix="$USR_LOCAL_PREFIX" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libfdk-aac.so" "FDKAAC"

    # Install WEBM
    git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git &&
        pushd libvpx &&
        ./configure --prefix="$USR_LOCAL_PREFIX" \
            --disable-static --enable-shared \
            --disable-examples --disable-unit-tests \
            --enable-vp9-highbitdepth --as=yasm &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libvpx.so" "WEBM"

    # Install X264 (H.264 Codec)
    git clone --depth 1 https://code.videolan.org/videolan/x264.git &&
        pushd x264 &&
        PKG_CONFIG_PATH="$USR_LOCAL_PREFIX/lib/pkgconfig" ./configure \
            --enable-shared --disable-static \
            --prefix="$USR_LOCAL_PREFIX" \
            --bindir="/usr/bin" &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libx264.so" "X264"

    # Install X265 (H.265 Codec)
    git clone https://bitbucket.org/multicoreware/x265_git.git &&
        pushd x265_git/build/linux &&
        cmake -G "Unix Makefiles" \
            -DCMAKE_INSTALL_PREFIX="$USR_LOCAL_PREFIX" \
            -DBUILD_SHARED_LIBS=ON \
            ../../source &&
        make -j $CPUS &&
        make install
    popd
    check_installation "$USR_LOCAL_PREFIX/lib/libx265.so" "X265"
}

install_ffmpeg() {
    if [ "$HAS_GPU" == "true" ]; then
        NVIDIA_CFLAGS="-I$CUDA_HOME/include"
        NVIDIA_LDFLAGS="-L$CUDA_HOME/lib64"
        NVIDIA_FFMPEG_OPTS="--enable-cuda-nvcc --nvcc=$CUDA_HOME/bin/nvcc --enable-cuda --enable-cuvid --enable-nvenc"
    fi

    # Install FFMPEG (AV1 Codec Library)
    $DOWNLOAD https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 &&
        tar -jxf ffmpeg-snapshot.tar.bz2 &&
        pushd ffmpeg &&
        PKG_CONFIG_PATH="$USR_LOCAL_PREFIX/lib/pkgconfig:/usr/lib64/pkgconfig:/usr/share/pkgconfig:/usr/lib/pkgconfig:$USR_LOCAL_PREFIX/lib/pkgconfig" \
            ./configure \
            --prefix="$USR_LOCAL_PREFIX" \
            --disable-static --enable-shared \
            --extra-cflags="-I$USR_LOCAL_PREFIX/include $NVIDIA_CFLAGS" \
            --extra-ldflags="-L$USR_LOCAL_PREFIX/lib $NVIDIA_LDFLAGS" \
            --extra-libs='-lpthread -lm' \
            --bindir="$USR_LOCAL_PREFIX/bin" \
            --enable-gpl \
            --enable-libaom \
            --enable-libass \
            --enable-libfdk-aac \
            --enable-libfreetype \
            --enable-libmp3lame \
            --enable-libopus \
            --enable-libvorbis \
            --enable-libvpx \
            --enable-libx264 \
            --enable-libx265 \
            --enable-nonfree \
            --enable-openssl \
            $NVIDIA_FFMPEG_OPTS &&
        make -j $CPUS &&
        make install
    cp LICENSE.md /tmp/LICENSE.md
    popd
    check_installation "$USR_LOCAL_PREFIX/bin/ffmpeg" "ffmpeg"
    check_installation "$USR_LOCAL_PREFIX/bin/ffprobe" "ffprobe"
    ldconfig
    $USR_LOCAL_PREFIX/bin/ffmpeg -version >/tmp/version.txt
}

# Execute Functions
install_utils
setup_gpu
source $HOME_DIR/.bashrc
install_ffmpeg_prereqs
install_ffmpeg
popd
rm -fr $SRC_DIR
