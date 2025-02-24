import { LightningElement, track, wire } from 'lwc';
import getContact from '@salesforce/apex/ContactAccountfieldUpdateController.getContact';
import updateContactsAndAccounts from '@salesforce/apex/ContactAccountfieldUpdateController.updateContactsAndAccounts';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { 
        label: 'Contact Name', 
        fieldName: 'ContactUrl', 
        type: 'url', 
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } 
    },
    { label: 'Id', fieldName: 'Id' },
    { label: 'AccountId', fieldName: 'AccountId' },
    { label: 'Industry', fieldName: 'Industry' }
];

export default class ContactAccountfieldUpdate extends LightningElement {
    @track data = [];
    columns = COLUMNS;
    selectedRows = [];
    contactresponc;
    showLoadingSpinner = false;

    @wire(getContact)
    wireGetContact(response) {
        this.contactresponc = response;
        let { data, error } = response;
        if (data) {
            this.data = data.map(contact => ({
                Id: contact.Id,
                Name: contact.Name,
                AccountId: contact.AccountId,
                ContactUrl: `/lightning/r/Contact/${contact.Id}/view`
            }));
        } else if (error) {
            console.error('Error fetching contacts:', error);
        }
    }

    handleRowAction(event) {
        this.selectedRows = event.detail.selectedRows.map(row => row.AccountId);
        console.log('Selected Account IDs:', this.selectedRows);
    }

    async syncData() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'No contacts selected!', 'error');
            return;
        }

        this.showLoadingSpinner = true;

        try {
            await updateContactsAndAccounts({ AccountIds: this.selectedRows });
            this.showToast('Success', 'Contacts & Accounts updated successfully', 'success');

            // Refresh the data
            await refreshApex(this.contactresponc);
        } catch (error) {
            console.error('Error updating records:', error);
            this.showToast('Error', 'Something went wrong!', 'error');
        } finally {
            this.showLoadingSpinner = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}
