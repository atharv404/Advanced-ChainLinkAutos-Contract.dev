const { execSync } = require("child_process");

async function main() {
  try {
    console.log("Running compile...");
    execSync("npx hardhat compile", { stdio: "inherit" });

    console.log("Running tests...");
    execSync("npx hardhat test", { stdio: "inherit" });

    console.log("ALL TESTS PASSED");
  } catch (e) {
    console.error("TESTS FAILED");
    process.exit(1);
  }
}

main();
