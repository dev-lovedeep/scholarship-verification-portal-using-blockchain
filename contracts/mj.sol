// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "hardhat/console.sol";

contract ScholorhsipPortal{

    struct Scholorship
    {
        string orgName;
        uint amount;
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
    }

    Student[] public registeredStudents;
    Organization[] public registeredOrganizations;
    mapping(uint=>Student) registeredStudentsmp;
    mapping(address=>Organization) public registeredOrganizationsmp;

    function registerStudent(uint _aadhar,uint _accNum) public
    {
        //check if student already registered
        require(registeredStudentsmp[_aadhar].aadhar== 0, "student already registered");

        registeredStudents.push();
        Student storage s=registeredStudents[registeredStudents.length-1];
        s.aadhar=_aadhar;
        s.accNum = _accNum;
        s.receivedGovScholorship = false;
        s.lock = false;
        registeredStudentsmp[_aadhar]=s;
        // s.scholorships = new Scholorship[](0);
    }

    function registerOrganization(string memory _name,bool _isgov,uint _fs) public
    {      
        //check if student already registered
        require(bytes(registeredOrganizationsmp[msg.sender].name).length== 0, "organization with this address already exist");

        Organization memory org = Organization({name:_name,isGov:_isgov,fundSanctioned:_fs,fundDistributed:0});
        registeredOrganizations.push(org);
        registeredOrganizationsmp[msg.sender] = org;
    }

    //TODO: can add a check that only registered org can see the data
    function getStudentDetail(uint _aadhar) public view returns(Student memory)
    {
        return registeredStudentsmp[_aadhar];
    }

    function getOrganizationDetail(address orgAddr ) public view returns(Organization memory)
    {
        return registeredOrganizationsmp[orgAddr];
    }

    function verifyPayment(uint studentId,uint amount,string memory txnId) public returns(string memory)
    {
        //add check: only registered org can call this function
        require(bytes(registeredOrganizationsmp[msg.sender].name).length != 0,"your organization is not registered");

        //check if the student is registered
        require(registeredStudentsmp[studentId].aadhar!= 0,"student is not registered on the portal");
        //check if student is already having government scholorship
        require(!registeredStudentsmp[studentId].receivedGovScholorship,"student has already received goverment scholorship");

        //check enough funds available
        Organization storage org = registeredOrganizationsmp[msg.sender];
        uint bal = org.fundSanctioned-org.fundDistributed;
        require(bal-amount>=0,"not enough funds");

        //verify transaction
        
        //add it to distributed fund
        org.fundDistributed+=amount;

        //check type of org:gov/private and update the student record accordingly
        if(registeredOrganizationsmp[msg.sender].isGov)
        {
        Student storage stud = registeredStudentsmp[studentId];
        stud.receivedGovScholorship=true;
        }


    }
}