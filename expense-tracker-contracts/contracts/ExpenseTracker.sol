// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ExpenseTracker {
    struct Expense {
        uint256 id;
        string description;
        uint256 amount;
        string[] tags;
        uint256 timestamp;
        address owner;
    }

    struct Tag {
        string name;
        bool exists;
    }

    mapping(address => Expense[]) private userExpenses;
    mapping(address => mapping(string => Tag)) private userTags;
    mapping(address => string[]) private userTagList;

    event ExpenseAdded(uint256 id, string description, uint256 amount, string[] tags);
    event TagCreated(string name);

    function addExpense(string memory _description, uint256 _amount, string[] memory _tags) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        for(uint i = 0; i < _tags.length; i++) {
            require(userTags[msg.sender][_tags[i]].exists, "Tag does not exist");
        }

        uint256 expenseId = userExpenses[msg.sender].length;
        Expense memory newExpense = Expense({
            id: expenseId,
            description: _description,
            amount: _amount,
            tags: _tags,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        userExpenses[msg.sender].push(newExpense);
        emit ExpenseAdded(expenseId, _description, _amount, _tags);
    }

    function createTag(string memory _name) public {
        require(bytes(_name).length > 0, "Tag name cannot be empty");
        require(!userTags[msg.sender][_name].exists, "Tag already exists");

        userTags[msg.sender][_name] = Tag(_name, true);
        userTagList[msg.sender].push(_name);
        emit TagCreated(_name);
    }

    function getUserExpenses() public view returns (Expense[] memory) {
        return userExpenses[msg.sender];
    }

    function getUserTags() public view returns (string[] memory) {
        return userTagList[msg.sender];
    }

    function getExpensesByTag(string memory _tag) public view returns (Expense[] memory) {
        require(userTags[msg.sender][_tag].exists, "Tag does not exist");
        
        uint256 count = 0;
        for(uint i = 0; i < userExpenses[msg.sender].length; i++) {
            string[] memory tags = userExpenses[msg.sender][i].tags;
            for(uint j = 0; j < tags.length; j++) {
                if(keccak256(bytes(tags[j])) == keccak256(bytes(_tag))) {
                    count++;
                    break;
                }
            }
        }

        Expense[] memory filteredExpenses = new Expense[](count);
        uint256 currentIndex = 0;
        
        for(uint i = 0; i < userExpenses[msg.sender].length; i++) {
            string[] memory tags = userExpenses[msg.sender][i].tags;
            for(uint j = 0; j < tags.length; j++) {
                if(keccak256(bytes(tags[j])) == keccak256(bytes(_tag))) {
                    filteredExpenses[currentIndex] = userExpenses[msg.sender][i];
                    currentIndex++;
                    break;
                }
            }
        }

        return filteredExpenses;
    }
}