async function main() {
    // We get the contract to deploy
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();

    let provider = ethers.getDefaultProvider();

    console.log("Token address:", modnft.address);

    const [owner, addr1] = await ethers.getSigners();

    console.log("hej 1",await provider.getBalance(addr1));

    await modnft.connect(addr1).mint({value:1000000000000000000});
  
    console.log("hej 2",await provider.getBalance(addr1));
    // console.log(await modnft.address);
    // console.log(await modnft.functions);

    const bajs = await modnft.mint({value: 1000000000000000});

    const rc = await bajs.wait();
    const event = rc.events.find(event => event.event === 'minted');
    const [to, id] = event.args;
    console.log("hej--------------------------",to, id);


    // console.log(await modnft.ownerOf(1));


    // console.log(await modnft.tokenURI(1));
    // console.log(await modnft.tokenURI(2));
    // console.log(await modnft.tokenURI(3));

    // console.log(await modnft.nftCounter());

    // await modnft.on('minted', (id) => {
    //   console.log('###########')
    // })

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });