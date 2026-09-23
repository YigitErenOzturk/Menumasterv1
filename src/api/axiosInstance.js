// Axios is no longer used by MenuMaster.
// This file is kept so old imports do not break while migrating.
const api = {
    get() { throw new Error('Legacy Axios API disabled. Use Supabase services.'); },
    post() { throw new Error('Legacy Axios API disabled. Use Supabase services.'); },
    put() { throw new Error('Legacy Axios API disabled. Use Supabase services.'); },
    delete() { throw new Error('Legacy Axios API disabled. Use Supabase services.'); }
};
export default api;
