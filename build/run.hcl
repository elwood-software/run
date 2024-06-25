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
  default = "us-west-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0ca1f30768d0cf0e1"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
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

source "amazon-ebs" "linux" {
  skip_create_ami = var.skip_ami
  region          = var.region
  source_ami      = var.source_ami
  instance_type   = var.instance_type
  ssh_username    = var.ssh_username
  ami_name        = "elwood-run-{{timestamp}}" 
  profile         = var.profile
  access_key      = var.access_key
  secret_key      = var.secret_key

}

build {
  name = "elwood-run"

  sources = [
    "source.amazon-ebs.linux"
  ]

  provisioner "shell-local" {
    inline = [
      "cd ..",
      "zip -r source.zip build/*.sh src/ deno.lock deno.json"
    ]
  }

  provisioner "file" {
    generated = true
    source = "../source.zip"
    destination = "/tmp/source.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo yum -y install unzip",
      "sudo mkdir -p /elwood/run-compiler",
      "sudo unzip /tmp/source.zip -d /elwood/run-compiler",
      "ls /elwood/run-compiler",
      "sudo chmod +x /elwood/run-compiler/build/bootstrap.sh /elwood/run-compiler/build/compile.sh",
      "sudo /elwood/run-compiler/build/compile.sh",
      "sudo mkdir -p /elwood/run/bin/",
      "sudo mv /elwood/run-compiler/runtime /elwood/run/bin/runtime",
      "sudo /elwood/run-compiler/build/bootstrap.sh",
      "sudo rm -r /elwood/run-compiler"
    ]
  }

}