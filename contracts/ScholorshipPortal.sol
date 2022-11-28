// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.12 <0.9.0;
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ScholorshipPortal is ChainlinkClient, ConfirmedOwner{
    using Chainlink for Chainlink.Request;

    uint256 public volume;
    bytes32 private jobId;
    uint256 private fee;


    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
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

    //these variable hold temporary value 
    address private currOrgAddress;
    uint private currStudentId;
    string private currTxnId;


    modifier onlyVerifiedOrg {
        require(bytes(registeredOrganizations[msg.sender].name).length != 0,"your organization is not registered");
        require(registeredOrganizations[msg.sender].isVerified,"your organization is not verified");
        _;
   }


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
        require(bytes(registeredOrganizations[msg.sender].name).length== 0,
         "organization with this address already exist");

        Organization memory org = Organization({
        name:_name,
        isGov:_isgov,
        fundSanctioned:_fs,
        fundDistributed:0,
        isVerified:false});
        registeredOrganizations[msg.sender] = org;
    }

    function getStudentDetail(uint _aadhar) public view onlyVerifiedOrg returns(Student memory)
    {
        Student memory stud = registeredStudents[_aadhar];
        require(stud.aadhar!=0, "student does not exist");
        return stud;
    }

    function lockProfile(uint _aadhar) public onlyVerifiedOrg
    {
        require(registeredStudents[_aadhar].aadhar!=0, "student does not exist");
        Student storage stud = registeredStudents[_aadhar];
        stud.lock=true;
    }

    function getOrganizationDetail(address orgAddr ) public view returns(Organization memory)
    {
        Organization memory org = registeredOrganizations[orgAddr];
        require(bytes(org.name).length!= 0,
         "organization with this address does not exist");
         return org;
    }

   function makeVerificationRequest(
    string memory txnId,
    uint256 aadhar,
    uint256 accno) private {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        // string memory url="https://transaction-verify.onrender.com/verify?txn=abcdef12345&account=12345678";
        string memory url = string.concat(
            "https://transaction-verify.onrender.com/verify?txn=",
            txnId,
            "&account=", 
            Strings.toString(accno),
            "&aadhar=",Strings.toString(aadhar));

        // Set the URL to perform the GET request on
        req.add(
            "get",
            url
        );
        req.add("path", "amount"); 
        // can multiply the answer by 100 to remove decimal and keep the calc in term of paisa unit
        int256 timesAmount = 1; 
        req.addInt("times", timesAmount);
        // Sends the request
        sendChainlinkRequest(req, fee);
    }

    function fulfill(
        bytes32 _requestId,
        uint256 _volume
    ) public recordChainlinkFulfillment(_requestId) {
        // emit RequestVolume(_requestId, _volume);
        volume = _volume;
        updateDataAfterVerification(_volume);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    
    function updateDataAfterVerification(uint amount) private
    {

        require(amount>0,"invalid transaction");

        //check enough funds available
        Organization storage org = registeredOrganizations[currOrgAddress];
        uint bal = org.fundSanctioned-org.fundDistributed;
        require(bal-amount>=0,"you dont enough funds,thus invalid transaction");

        //add it to distributed fund
        org.fundDistributed+=amount;
        
        txnDoneBy[currTxnId]=org.name;
        //check type of org:gov/private and update the student record accordingly
        Student storage stud = registeredStudents[currStudentId];
        if(registeredOrganizations[currOrgAddress].isGov)
        {
        stud.receivedGovScholorship=true;
        stud.lock = false;
        }

        Scholorship memory scholorship = Scholorship(org.name,amount,currTxnId);
        stud.scholorships.push(scholorship);
         
    }

    function verifyPayment(uint studentId,uint accno,string memory txnId) public onlyVerifiedOrg
    {

        require(bytes(txnDoneBy[txnId]).length==0,"this transaction has already occured");

        //check if the student is registered
        require(registeredStudents[studentId].aadhar!= 0,"student is not registered on the portal");
        
        //if org is government and student already have goverment scholorship then reject
        if(registeredOrganizations[msg.sender].isGov)
        {
            require(!registeredStudents[studentId].receivedGovScholorship,"student has already received goverment scholorship");
        }

        //set details so that they can be used after the request is fullfilled
        currOrgAddress = msg.sender;
        currStudentId = studentId;
        currTxnId=txnId;

        //verify transaction
        makeVerificationRequest(txnId,studentId,accno);
    }
}