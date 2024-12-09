packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "region" {
  type    = string
}

variable "source_ami" {
  type    = string
}

variable "instance_type" {
  type    = string
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "skip_ami" {
  type    = bool
  default = false
}

variable "profile" {
  type    = string
  default = "elwood"
}

variable "access_key" {
  type    = string
  default = env("AWS_ACCESS_KEY_ID")
  sensitive = true
}

variable "secret_key" {
  type    = string
  default = env("AWS_SECRET_KEY")
  sensitive = true
}

variable "arch" {
  type    = string
}

source "amazon-ebs" "linux" {
  skip_create_ami = var.skip_ami
  region          = var.region
  source_ami      = var.source_ami
  instance_type   = var.instance_type
  ssh_username    = var.ssh_username
  ami_name        = "elwood-run-${var.arch}-{{timestamp}}" 
  profile         = var.profile
  access_key      = var.access_key
  secret_key      = var.secret_key
  launch_block_device_mappings {
    device_name = "/dev/xvda"
    volume_size = 40
    volume_type = "gp3"
    delete_on_termination = true
  }
}

build {
  name = "elwood-run"

  sources = [
    "source.amazon-ebs.linux"
  ]

  provisioner "shell-local" {
    inline = [
      "zip -r source.zip build/*.sh src/ deno.lock deno.json"
    ]
  }

  provisioner "file" {
    generated = true
    source = "./source.zip"
    destination = "/tmp/source.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo yum -y install unzip",
      "sudo mkdir -p /elwood/run-compiler",
      "sudo unzip /tmp/source.zip -d /elwood/run-compiler",
      "ls /elwood/run-compiler",
      "sudo chmod +x /elwood/run-compiler/build/bootstrap.sh /elwood/run-compiler/build/compile.sh /elwood/run-compiler/build/install-ffmpeg-arm64.sh /elwood/run-compiler/build/install-ffmpeg-x64.sh",
      "sudo /elwood/run-compiler/build/compile.sh",
      "sudo mkdir -p /elwood/run/bin/",
      "sudo mv /elwood/run-compiler/runtime /elwood/run/bin/runtime",
      "sudo /elwood/run-compiler/build/bootstrap.sh",
      "sudo /elwood/run-compiler/build/install-ffmpeg-${var.arch}.sh --stdout",
      "sudo rm -r /elwood/run-compiler",      
      "echo \"export ELWOOD_RUNNER_ROOT=/elwood/run\" >> /home/ec2-user/.bashrc",
      "echo \"export ELWOOD_RUNNER_WORKSPACE_DIR=/elwood/run/runner/workspace\" >> /home/ec2-user/.bashrc",
      "echo \"export ELWOOD_RUNNER_EXECUTION_UID=3982\" >> /home/ec2-user/.bashrc",
      "echo \"export ELWOOD_RUNNER_EXECUTION_GID=3982\" >> /home/ec2-user/.bashrc",
      "echo \"export ELWOOD_RUNNER_DENO_BIN=/elwood/run/runner/bin/deno\" >> /home/ec2-user/.bashrc",
    ]
  }

  provisioner "file" {
    direction = "download"
    source = "/tmp/version.txt"
    destination = "./docs/build-data/version-${var.arch}.txt"
  }

  # provisioner "file" {
  #   direction = "download"
  #   source = "/tmp/LICENSE.txt"
  #   destination = "./docs/build-data/license-${var.arch}.txt"
  # }
}