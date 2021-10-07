async function main() {
    // We get the contract to deploy
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();

    console.log("Token address:", modnft.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });