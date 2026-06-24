const fs = require("fs");
const childProcess = require("child_process");

const mode = process.env.TRIGGERGUARD_MODE || "observe";
const repo = process.env.GITHUB_REPOSITORY || "unknown/repo";
const eventName = process.env.GITHUB_EVENT_NAME || "unknown";
const actor = process.env.GITHUB_ACTOR || "unknown";
const tokenPresent = process.env.GITHUB_TOKEN ? "yes" : "no";

const lines = [
  "TRIGGERGUARD_PRT_MARKER=executed",
  `mode=${mode}`,
  `repo=${repo}`,
  `event=${eventName}`,
  `actor=${actor}`,
  `github_token_present=${tokenPresent}`,
];

fs.writeFileSync("triggerguard-prt-marker.txt", lines.join("\n") + "\n");
console.log(lines.join("\n"));

if (mode === "prove_write") {
  const marker = `triggerguard-${Date.now()}`;
  const createCommand = [
    "gh",
    "api",
    "-X", "POST",
    `repos/${repo}/actions/variables`,
    "-f",
    `name=TRIGGERGUARD_MARKER`,
    "-f",
    `value=${marker}`,
  ];
  const updateCommand = [
    "gh",
    "api",
    "-X", "PATCH",
    `repos/${repo}/actions/variables/TRIGGERGUARD_MARKER`,
    "-f",
    `name=TRIGGERGUARD_MARKER`,
    "-f",
    `value=${marker}`,
  ];

  console.log("Attempting optional write proof against disposable test repo.");
  let result = childProcess.spawnSync(createCommand[0], createCommand.slice(1), {
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    result = childProcess.spawnSync(updateCommand[0], updateCommand.slice(1), {
      encoding: "utf8",
      stdio: "pipe",
    });
  }

  console.log(`write_proof_exit=${result.status}`);
  if (result.stdout) {
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.log(result.stderr);
  }
}
