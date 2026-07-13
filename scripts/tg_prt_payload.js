const fs = require("fs");
const childProcess = require("child_process");

const mode = process.env.TRIGGERGUARD_MODE || "observe";
const payloadKind = process.env.TRIGGERGUARD_PAYLOAD_KIND || "prt";
const repo = process.env.GITHUB_REPOSITORY || "unknown/repo";
const eventName = process.env.GITHUB_EVENT_NAME || "unknown";
const actor = process.env.GITHUB_ACTOR || "unknown";
const tokenPresent = process.env.GITHUB_TOKEN ? "yes" : "no";
const markerFileByKind = {
  prt: "triggerguard-prt-marker.txt",
  wcall: "triggerguard-wcall-marker.txt",
  oidc: "triggerguard-oidc-marker.txt",
};
const markerLineByKind = {
  prt: "TRIGGERGUARD_PRT_MARKER=executed",
  wcall: "TRIGGERGUARD_WCALL_PAYLOAD_MARKER=executed",
  oidc: "TRIGGERGUARD_OIDC_PAYLOAD_MARKER=executed",
};
const markerFile = markerFileByKind[payloadKind] || markerFileByKind.prt;
const markerLine = markerLineByKind[payloadKind] || markerLineByKind.prt;

const lines = [
  markerLine,
  `mode=${mode}`,
  `payload_kind=${payloadKind}`,
  `repo=${repo}`,
  `event=${eventName}`,
  `actor=${actor}`,
  `github_token_present=${tokenPresent}`,
];

fs.writeFileSync(markerFile, lines.join("\n") + "\n");
console.log(lines.join("\n"));

if (mode === "prove_write") {
  const runId = process.env.GITHUB_RUN_ID || `${Date.now()}`;
  const proofPath = `triggerguard-proof/${payloadKind}-${runId}.txt`;
  const proofBody = [
    `TRIGGERGUARD_CONTENT_WRITE_PROOF=${payloadKind}`,
    `repo=${repo}`,
    `event=${eventName}`,
    `actor=${actor}`,
    `payload_kind=${payloadKind}`,
    `run_id=${runId}`,
  ].join("\n") + "\n";
  const encoded = Buffer.from(proofBody, "utf8").toString("base64");
  const command = [
    "gh",
    "api",
    "-X", "PUT",
    `repos/${repo}/contents/${proofPath}`,
    "-f", `message=TriggerGuard PRT content write proof ${runId}`,
    "-f", `content=${encoded}`,
  ];

  console.log("Attempting optional write proof against disposable test repo.");
  const result = childProcess.spawnSync(command[0], command.slice(1), {
    encoding: "utf8",
    stdio: "pipe",
  });

  console.log(`write_proof_exit=${result.status}`);
  console.log(`write_proof_path=${proofPath}`);
  if (result.stdout) {
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.log(result.stderr);
  }
}
