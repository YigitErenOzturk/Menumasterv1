import { supabase, response, throwSupabaseError, getSessionOrThrow } from './supabaseClient.js';

const currentProfile = async () => {
    const session = await getSessionOrThrow();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
    throwSupabaseError(error, 'Profile not found.');
    return data;
};

const mapRestaurant = (r) => ({
    ...r,
    phoneNumber: r.phone_number,
    imageUrl: r.image_url,
    createdDate: r.created_at
});

const mapReservation = (r) => ({
    ...r,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    peopleCount: r.people,
    restaurantName: r.restaurants?.name || 'Restaurant'
});

const mapReview = (r) => ({
    ...r,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    restaurantName: r.restaurants?.name || 'Restaurant',
    userName: r.profiles?.name || r.profiles?.username || 'Anonymous',
    createdAt: r.created_at,
    updatedAt: r.updated_at
});

export const userService = {
    getUserInfo: async (id) => {
        if (!id) return response(await currentProfile());
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        throwSupabaseError(error, 'User not found.');
        return response({ ...data, phoneNumber: data.phone_number, createdDate: data.created_at });
    },

    updateUser: async (id, payload) => {
        const profile = await currentProfile();
        if (Number(id) !== Number(profile.id)) throw new Error('You can only update your own profile.');

        const { data, error } = await supabase.from('profiles').update({
            name: payload.name,
            city: payload.city,
            phone_number: payload.phoneNumber ?? payload.phone_number,
            address: payload.address
        }).eq('id', profile.id).select().single();
        throwSupabaseError(error, 'Could not update profile.');
        return response({ ...data, phoneNumber: data.phone_number, createdDate: data.created_at });
    },

    getCities: async () => {
        const { data, error } = await supabase.from('restaurants').select('city').not('city', 'is', null);
        throwSupabaseError(error, 'Could not load cities.');
        return response([...new Set(data.map(x => x.city).filter(Boolean))].sort());
    },

    getPopularRestaurants: async () => {
        const { data, error } = await supabase.from('restaurants').select('*').order('rating', { ascending: false });
        throwSupabaseError(error, 'Could not load restaurants.');
        return response((data || []).map(mapRestaurant));
    },

    getAllRestaurants: async () => {
        const { data, error } = await supabase.from('restaurants').select('*').order('name');
        throwSupabaseError(error, 'Could not load restaurants.');
        return response((data || []).map(mapRestaurant));
    },

    getRestaurantsByCity: async (city) => {
        const { data, error } = await supabase.from('restaurants').select('*').eq('city', city).order('name');
        throwSupabaseError(error, 'Could not load restaurants.');
        return response((data || []).map(mapRestaurant));
    },

    getMyReservations: async () => {
        const profile = await currentProfile();
        const { data, error } = await supabase
            .from('reservations')
            .select('*, restaurants(name)')
            .eq('user_id', profile.id)
            .order('date', { ascending: false })
            .order('time', { ascending: false });
        throwSupabaseError(error, 'Could not load reservations.');
        return response((data || []).map(mapReservation));
    },

    cancelReservation: async (id) => {
        const profile = await currentProfile();
        const { data, error } = await supabase
            .from('reservations')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .eq('user_id', profile.id)
            .select()
            .single();
        throwSupabaseError(error, 'Could not cancel reservation.');
        return response(data);
    },

    getMyReviews: async () => {
        const profile = await currentProfile();
        const { data, error } = await supabase
            .from('reviews')
            .select('*, restaurants(name), profiles(name,username)')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        throwSupabaseError(error, 'Could not load reviews.');
        return response((data || []).map(mapReview));
    },

    updateReview: async (id, payload) => {
        const profile = await currentProfile();
        const { data, error } = await supabase
            .from('reviews')
            .update({ rating: payload.rating, comment: payload.comment })
            .eq('id', id)
            .eq('user_id', profile.id)
            .select()
            .single();
        throwSupabaseError(error, 'Could not update review.');
        return response(data);
    },

    deleteReview: async (id) => {
        const profile = await currentProfile();
        const { error } = await supabase.from('reviews').delete().eq('id', id).eq('user_id', profile.id);
        throwSupabaseError(error, 'Could not delete review.');
        return response({ ok: true });
    },

    forgotPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)}password-reset.html`
        });
        throwSupabaseError(error, 'Could not send password reset email.');
        return response({ ok: true });
    },

    register: async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    role: 'user',
                    name: userData.name,
                    username: userData.username,
                    phone_number: userData.phoneNumber,
                    city: userData.city,
                    address: userData.address
                }
            }
        });
        throwSupabaseError(error, 'Could not create account.');
        return response(data);
    },

    login: async (credentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.usernameOrEmail,
            password: credentials.password
        });
        throwSupabaseError(error, 'Invalid email or password.');

        const { data: profile, error: profileError } = await supabase
            .from('profiles').select('*').eq('auth_user_id', data.user.id).single();
        throwSupabaseError(profileError, 'User profile not found.');

        return response({
            token: data.session?.access_token,
            userId: profile.id,
            id: profile.id,
            name: profile.name,
            user: data.user
        });
    }
};
