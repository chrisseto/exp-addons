import Ember from 'ember';
import ApplicationAdapter from './application';
import JamDocumentAdapter from '../mixins/jam-document-adapter';


let {RSVP} = Ember;
let bcrypt = dcodeIO.bcrypt;


export default ApplicationAdapter.extend(JamDocumentAdapter, {
    createRecord: function createRecord(store, type, snapshot) {
        var data = {};
        var serializer = store.serializerFor(type.modelName);
        var url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

        serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

        return RSVP.denodeify(bcrypt.genSalt)(12)
            .then(salt => RSVP.denodeify(bcrypt.hash)(data.data.attributes.password, salt.replace('$2a$', '$2b$')))
            .then(hashed => {
                data.data.attributes.password = hashed;
                return data;
            })
            .then(data => this.ajax(url, 'POST', {data: data}))
    },
});
