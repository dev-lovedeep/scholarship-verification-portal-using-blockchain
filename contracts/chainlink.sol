// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract ScholorhsipPortal is ChainlinkClient, ConfirmedOwner{
    using Chainlink for Chainlink.Request;
    // address owner;
    bytes32 private jobId;
    uint256 private fee;
    uint256 public btc;
    uint256 public usd;
    uint256 public eur;


    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x01BE23585060835E02B77ef475b0Cc51aA1e0709);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        //old oracle: 0xf3FBB7f3391F62C8fe53f89B41dFC8159EE9653f
        // owner = msg.sender;
        jobId = "ca98366cc7314957b8c012c72f05aeeb";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    struct Scholorship
    {
        string orgName;
        uint amount;
        string txnId;
    }

    struct Student{
        uint aadhar;
        uint accNum;
        bool receivedGovScholorship;
        Scholorship[] scholorships;
        bool lock;
    }

    struct Organization{
        string name;
        bool isGov;
        uint fundSanctioned;
        uint fundDistributed;
        bool isVerified;
    }

    mapping(uint=>Student) public registeredStudents;
    mapping(address=>Organization) public registeredOrganizations;
    mapping (string=>string) public txnDoneBy;


    modifier onlyVerifiedOrg {
        require(bytes(registeredOrganizations[msg.sender].name).length != 0,"your organization is not registered");
        require(registeredOrganizations[msg.sender].isVerified,"your organization is not verified");
        _;
   }

//    modifier onlyOwner {
//       require(msg.sender == owner);
//       _;
//    }

    function verifyOrganization(address orgAddr) public onlyOwner{
        require(bytes(registeredOrganizations[orgAddr].name).length != 0,"no such organization exist");
        Organization storage org = registeredOrganizations[orgAddr];
        org.isVerified= true;
    }

    function registerStudent(uint _aadhar,uint _accNum) public
    {
        //check if student already registered
        require(registeredStudents[_aadhar].aadhar== 0, "student already registered");

        Student storage s=registeredStudents[_aadhar];
        s.aadhar=_aadhar;
        s.accNum = _accNum;
        s.receivedGovScholorship = false;
        s.lock = false;
    }

    function registerOrganization(string memory _name,bool _isgov,uint _fs) public
    {      
        //check if some already registered with sender address
        require(bytes(registeredOrganizations[msg.sender].name).length== 0, "organization with this address already exist");

        Organization memory org = Organization({name:_name,isGov:_isgov,fundSanctioned:_fs,fundDistributed:0,isVerified:false});
        registeredOrganizations[msg.sender] = org;
    }

    function getStudentDetail(uint _aadhar) public view onlyVerifiedOrg returns(Student memory)
    {
        return registeredStudents[_aadhar];
    }

    function getOrganizationDetail(address orgAddr ) public view returns(Organization memory)
    {
        return registeredOrganizations[orgAddr];
    }

    function requestMultipleParameters() public {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );
        req.add(
            "urlBTC",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC"
        );
        req.add("pathBTC", "BTC");
        req.add(
            "urlUSD",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
        );
        req.add("pathUSD", "USD");
        req.add(
            "urlEUR",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR"
        );
        req.add("pathEUR", "EUR");
        sendChainlinkRequest(req, fee); // MWR API.
    }

    function fulfillMultipleParameters(
        bytes32 requestId,
        uint256 btcResponse,
        uint256 usdResponse,
        uint256 eurResponse
    ) public recordChainlinkFulfillment(requestId) {
        // emit RequestMultipleFulfilled(
        //     requestId,
        //     btcResponse,
        //     usdResponse,
        //     eurResponse
        // );
        btc = btcResponse;
        usd = usdResponse;
        eur = eurResponse;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    
    function validateTxn(uint studentId,uint amount,string memory txnId) private view returns(bool)
    {

        //take account from api;

        //take amount from api;

        //match data

        //IDEA:thinking of omitting this amount
    }

    function verifyPayment(uint studentId,uint amount,string memory txnId) public onlyVerifiedOrg
    {

        require(bytes(txnDoneBy[txnId]).length==0,"this transaction has already occured");

        //check if the student is registered
        require(registeredStudents[studentId].aadhar!= 0,"student is not registered on the portal");
        
        //if the org is private, then scholorship allowed
        //but if org is government and student already have goverment scholorship then reject
        require(!registeredOrganizations[msg.sender].isGov||!registeredStudents[studentId].receivedGovScholorship,"student has already received goverment scholorship");

        //check enough funds available
        Organization storage org = registeredOrganizations[msg.sender];
        uint bal = org.fundSanctioned-org.fundDistributed;
        require(bal-amount>=0,"not enough funds");

        //verify transaction
        validateTxn(studentId,amount,txnId);
        //add it to distributed fund
        org.fundDistributed+=amount;
        
        txnDoneBy[txnId]=org.name;
        //check type of org:gov/private and update the student record accordingly
        Student storage stud = registeredStudents[studentId];
        if(registeredOrganizations[msg.sender].isGov)
        {
        stud.receivedGovScholorship=true;
        stud.lock = false;
        }

        Scholorship memory scholorship = Scholorship(org.name,amount,txnId);
        stud.scholorships.push(scholorship);
    }
}