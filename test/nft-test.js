const { mnemonicToEntropy } = require("@ethersproject/hdnode");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Change price and Cap", function () {
  it("Should construct with nftcounter 0, nftcap 2000, price 10000000000", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    expect(await modnft.nftCounter()).to.equal(0);
    expect(await modnft.nftCap()).to.equal(2000);
    expect(await modnft.weiPrice()).to.equal(10000000000);
  });

  it("Owner can change nftCap", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    expect(await modnft.nftCap()).to.equal(2000);

    const changecap = await modnft.changeNftCap(2001)

    expect(await modnft.nftCap()).to.equal(2001);
  });

  it("Not owner can not change nftCap", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    const [owner, addr1] = await ethers.getSigners();

    expect(await modnft.nftCap()).to.equal(2000);

    await expect(modnft.connect(addr1).changeNftCap(2001)).to.be.reverted;

    expect(await modnft.nftCap()).to.equal(2000);
  });

  it("NftCap can not be changed to less than nftcounter", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    expect(await modnft.nftCap()).to.equal(2000);
    await modnft.mint(2, {value: 20000000000});

    await expect(modnft.changeNftCap(1)).to.be.reverted;

    expect(await modnft.nftCap()).to.equal(2000);
  });

  it("NftCap can be changed to equal nftcounter", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    expect(await modnft.nftCap()).to.equal(2000);
    await modnft.mint(2, {value: 20000000000});
    await modnft.changeNftCap(2);

    expect(await modnft.nftCap()).to.equal(2);
  });

  it("Owner can change price", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    expect(await modnft.weiPrice()).to.equal(10000000000);

    const changecap = await modnft.changePrice(10000000001)

    expect(await modnft.weiPrice()).to.equal(10000000001);
  });

  it("Not owner can not change price", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();

    const [owner, addr1] = await ethers.getSigners();

    expect(await modnft.weiPrice()).to.equal(10000000000);

    await expect(modnft.connect(addr1).changePrice(10000000001)).to.be.reverted;

    expect(await modnft.weiPrice()).to.equal(10000000000);
  });

  it("Price can not be less than 0", async function () {
    const Modnft = await ethers.getContractFactory("Modnft");
    const modnft = await Modnft.deploy();
    await modnft.deployed();


    expect(await modnft.weiPrice()).to.equal(10000000000);

    await expect(modnft.changePrice(-100)).to.be.reverted; // I DONT UNDRESTAN WHY THIS REVERTS?

    expect(await modnft.weiPrice()).to.equal(10000000000);
  });
});

describe("Minting and NFT handeling", function () {
    it("Can mint one nft to signer of tx", async function () {
      const Modnft = await ethers.getContractFactory("Modnft");
      const modnft = await Modnft.deploy();
      await modnft.deployed();

      const [owner, addr1] = await ethers.getSigners();
  
      await modnft.connect(addr1).mint(1, {value: 10000000000});

      expect(await modnft.ownerOf(0)).to.equal(addr1.address);
    });

    it("Can mint multiple nfts to signer of tx", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
    
        await modnft.connect(addr1).mint(3, {value: 30000000000});
  
        expect(await modnft.ownerOf(0)).to.equal(addr1.address);
        expect(await modnft.ownerOf(1)).to.equal(addr1.address);
        expect(await modnft.ownerOf(2)).to.equal(addr1.address);
      });    

      it("Passing number not 1 - 3 to mint should revert", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
    
        await expect(modnft.mint(0, {value: 0})).to.be.reverted;
        await expect(modnft.mint(4, {value: 40000000000})).to.be.reverted;
      });  
      
      it("Passing wrong price to mint should revert", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
    
        await expect(modnft.mint(2, {value: 20000000001})).to.be.reverted;
      });
      
      it("Should deduct Eth from sender and add Eth to owner", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
    
        await expect(await modnft.connect(addr1).mint(2, {value: 20000000000}))
        .to.changeEtherBalances([addr1, owner], [-20000000000, 20000000000]);
      });

      it("Should emit event on mint", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
    
        await expect(await modnft.connect(addr1).mint(1, {value: 10000000000})).to.emit(modnft, 'minted').withArgs(addr1.address, 0);
      });

      it("Should count up nftCounter on mint", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();

        expect(await modnft.nftCounter()).to.equal(0);
    
        await modnft.mint(1, {value: 10000000000});

        expect(await modnft.nftCounter()).to.equal(1);
      });

      it("Should revert if nftCounter is nftCap", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();

        await modnft.changeNftCap(1);
        await modnft.mint(1, {value: 10000000000});

        await expect(modnft.mint(1, {value: 10000000000})).to.be.reverted;
      });

      it("Should revert if minting 3 and nftCounter is nftCap-2", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();

        await modnft.changeNftCap(2);

        await expect(modnft.mint(3, {value: 30000000000})).to.be.reverted;
      });

  });

  describe("Whitelist", function () {
    it("Owner can add to whitelist", async function () {
      const Modnft = await ethers.getContractFactory("Modnft");
      const modnft = await Modnft.deploy();
      await modnft.deployed();

      const [owner, addr1] = await ethers.getSigners();
  
      await modnft.addToWhitelist([addr1.address]);
      expect(await modnft.whitelist(addr1.address)).to.equal(1);
    });

    it("Not owner can not add to whitelist", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
    
        await expect(modnft.connect(addr1).addToWhitelist([addr1.address])).to.be.reverted;
      });

    it("Three addresses can be added to whitelist", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
        await modnft.addToWhitelist([addr1.address, addr2.address, addr3.address]);

        expect(await modnft.whitelist(addr1.address)).to.equal(1);
        expect(await modnft.whitelist(addr2.address)).to.equal(1);
        expect(await modnft.whitelist(addr3.address)).to.equal(1);
      });

    it("Should revert if address not on whitelist", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
        
        await expect(modnft.connect(addr1).mintWhitelist()).to.be.reverted;
      }); 

    it("Should mint and emit if address is on whitelist", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();

        await modnft.addToWhitelist([addr1.address]);
        await expect(await modnft.connect(addr1).mintWhitelist()).to.emit(modnft, 'minted').withArgs(addr1.address, 0);
      }); 

      it("Should mint if whitelisted and then not mint again", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();

        await modnft.addToWhitelist([addr1.address]);
        await modnft.connect(addr1).mintWhitelist();
        await expect(modnft.connect(addr1).mintWhitelist()).to.be.reverted;
      }); 

    it("Should mint if whitelisted and then not mint again even if added again", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();

        await modnft.addToWhitelist([addr1.address]);
        await modnft.connect(addr1).mintWhitelist();
        await modnft.addToWhitelist([addr1.address]);
        await expect(modnft.connect(addr1).mintWhitelist()).to.be.reverted;
      }); 

      it("Should revert if nftCounter is nftCap", async function () {
        const Modnft = await ethers.getContractFactory("Modnft");
        const modnft = await Modnft.deploy();
        await modnft.deployed();
  
        const [owner, addr1] = await ethers.getSigners();
        modnft.mint(1, {value: 10000000000})

        await modnft.addToWhitelist([addr1.address]);
        await modnft.changeNftCap(1);
        await expect(modnft.connect(addr1).mintWhitelist()).to.be.reverted;
      }); 
  });
  