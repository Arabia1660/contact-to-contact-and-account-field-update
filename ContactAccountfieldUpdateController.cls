 public with sharing class ContactAccountfieldUpdateController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContact() {
        return [SELECT Id, Name, Phone, Account.Rating, Account.Active__c,  Account.Industry FROM Contact
                
                WHERE AccountId != null AND Name != null AND  Account.Industry != null 
                LIMIT 10];
    }

    @AuraEnabled
    public static void updateContactsAndAccounts(List<Id> AccountIds) {
        System.debug('AccountIds --> ' + AccountIds);

        if (AccountIds == null || AccountIds.isEmpty()) {
            throw new AuraHandledException('No records selected');
        }

        // Fetch Accounts
        List<Account> accList = [SELECT Id FROM Account WHERE Id IN :AccountIds];

        if (accList.isEmpty()) {
            throw new AuraHandledException('No valid accounts found');
        }

        // Fetch Contacts linked to these Accounts
        List<Contact> contactList = [SELECT Id, AccountId FROM Contact WHERE AccountId IN :AccountIds];

        System.debug('contactList --> ' + contactList);

        // Create a map of Account Id -> Account record
        Map<Id, Account> accountMap = new Map<Id, Account>();
        for (Account acc : accList) {
            accountMap.put(acc.Id, acc);
        }

        // Update related Accounts
        for (Id accId : accountMap.keySet()) {
            accountMap.get(accId).Industry = 'Education'; // Ensure correct field name
        }

        // Perform DML operations
        if (!accountMap.isEmpty()) {
            update accountMap.values();
        }

        if (!contactList.isEmpty()) {
            update contactList;
        }
    }
}
