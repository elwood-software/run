type Image = {
  source_ami: string;
  arch: string;
  instance_type: string;
  region: string;
};

const images: Image[] = [
  // {
  //   source_ami: "ami-06b21ccaeff8cd686",
  //   arch: "x64",
  //   instance_type: "t3.small",
  //   region: "us-east-1",
  // },
  // {
  //   source_ami: "ami-02801556a781a4499",
  //   arch: "arm64",
  //   instance_type: "t4g.small",
  //   region: "us-east-1",
  // },

  {
    source_ami: "ami-0453ec754f44f9a4a",
    arch: "nvidia",
    instance_type: "p3.2xlarge",
    region: "us-east-1",
  },
];

for (const img of images) {
  const cmd = new Deno.Command("packer", {
    args: [
      "build",
      "build/run.pkr.hcl",
    ],
    env: {
      PKR_VAR_source_ami: img.source_ami,
      PKR_VAR_arch: img.arch,
      PKR_VAR_instance_type: img.instance_type,
      PKR_VAR_region: img.region,
    },
    stderr: "inherit",
    stdout: "inherit",
  });

  console.log(`building ${img.arch} image...`);

  const result = await cmd.output();

  console.log(` > Packer Exit Code: ${result.code}`);
}
