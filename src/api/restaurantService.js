import { supabase, response, throwSupabaseError, getSessionOrThrow } from './supabaseClient.js';

const currentRestaurant = async () => {
    const session = await getSessionOrThrow();
    let { data, error } = await supabase.from('restaurants').select('*').eq('auth_user_id', session.user.id).single();

    // If the account was created before the restaurant row existed, create it from auth metadata.
    if (error && session.user.user_metadata?.role === 'restaurant') {
        const m = session.user.user_metadata || {};
        const insert = await supabase.from('restaurants').insert({
            auth_user_id: session.user.id,
            name: m.name || 'Restaurant',
            email: session.user.email,
            phone_number: m.phone_number || null,
            description: m.description || null,
            address: m.address || null,
            city: m.city || null,
            image_url: m.image_url || null
        }).select().single();
        throwSupabaseError(insert.error, 'Could not create restaurant profile.');
        data = insert.data;
    } else {
        throwSupabaseError(error, 'Restaurant profile not found.');
    }
    return data;
};

const mapRestaurant = (r) => ({ ...r, phoneNumber: r.phone_number, imageUrl: r.image_url, createdDate: r.created_at });
const mapMenu = (m) => ({ ...m, restaurantId: m.restaurant_id });
const mapReservation = (r) => ({
    ...r,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    peopleCount: r.people,
    restaurantName: r.restaurants?.name || 'Restaurant',
    userName: r.profiles?.name || r.profiles?.username || 'Customer'
});
const mapReview = (r) => ({
    ...r,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    userName: r.profiles?.name || r.profiles?.username || 'Anonymous',
    createdAt: r.created_at,
    updatedAt: r.updated_at
});

export const restaurantService = {
    getInfo: async (id) => {
        const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single();
        throwSupabaseError(error, 'Restaurant not found.');
        return response(mapRestaurant(data));
    },

    getAll: async () => {
        const { data, error } = await supabase.from('restaurants').select('*').order('name');
        throwSupabaseError(error, 'Could not load restaurants.');
        return response((data || []).map(mapRestaurant));
    },

    updateRestaurant: async (id, payload) => {
        const restaurant = await currentRestaurant();
        if (Number(id) !== Number(restaurant.id)) throw new Error('You can only update your own restaurant.');

        const { data, error } = await supabase.from('restaurants').update({
            name: payload.name,
            phone_number: payload.phoneNumber ?? payload.phone_number,
            description: payload.description,
            address: payload.address,
            city: payload.city,
            image_url: payload.imageUrl ?? payload.image_url
        }).eq('id', restaurant.id).select().single();
        throwSupabaseError(error, 'Could not update restaurant.');
        return response(mapRestaurant(data));
    },

    getMenu: async () => {
        const restaurant = await currentRestaurant();
        const { data, error } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id).order('category').order('name');
        throwSupabaseError(error, 'Could not load menu.');
        return response((data || []).map(mapMenu));
    },

    getMenuByRestaurant: async (restaurantId) => {
        const { data, error } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('category').order('name');
        throwSupabaseError(error, 'Could not load menu.');
        return response((data || []).map(mapMenu));
    },

    addMenuItem: async (item) => {
        const restaurant = await currentRestaurant();
        const { data, error } = await supabase.from('menu_items').insert({
            restaurant_id: restaurant.id,
            name: item.name,
            category: item.category,
            price: Number(item.price),
            description: item.description || null
        }).select().single();
        throwSupabaseError(error, 'Could not add menu item.');
        return response(mapMenu(data));
    },

    deleteMenuItem: async (id) => {
        const restaurant = await currentRestaurant();
        const { error } = await supabase.from('menu_items').delete().eq('id', id).eq('restaurant_id', restaurant.id);
        throwSupabaseError(error, 'Could not delete menu item.');
        return response({ ok: true });
    },

    getReservations: async () => {
        const restaurant = await currentRestaurant();
        const { data, error } = await supabase.from('reservations')
            .select('*, profiles(name,username), restaurants(name)')
            .eq('restaurant_id', restaurant.id)
            .order('date', { ascending: true }).order('time', { ascending: true });
        throwSupabaseError(error, 'Could not load reservations.');
        return response((data || []).map(mapReservation));
    },

    updateReservation: async (id, status) => {
        const restaurant = await currentRestaurant();
        const { data, error } = await supabase.from('reservations').update({ status })
            .eq('id', id).eq('restaurant_id', restaurant.id).select().single();
        throwSupabaseError(error, 'Could not update reservation.');
        return response(data);
    },

    getReviews: async (resId) => {
        const { data, error } = await supabase.from('reviews')
            .select('*, profiles(name,username)')
            .eq('restaurant_id', resId)
            .order('created_at', { ascending: false });
        throwSupabaseError(error, 'Could not load reviews.');
        return response({ reviews: (data || []).map(mapReview) });
    },

    register: async (restaurantData) => {
        const { data, error } = await supabase.auth.signUp({
            email: restaurantData.email,
            password: restaurantData.password,
            options: {
                data: {
                    role: 'restaurant',
                    name: restaurantData.name,
                    phone_number: restaurantData.phoneNumber,
                    description: restaurantData.description,
                    address: restaurantData.address,
                    city: restaurantData.city,
                    image_url: restaurantData.imageUrl
                }
            }
        });
        throwSupabaseError(error, 'Could not create restaurant account.');

        if (data.session) {
            const { data: restaurant, error: insertError } = await supabase.from('restaurants').insert({
                auth_user_id: data.user.id,
                name: restaurantData.name,
                email: restaurantData.email,
                phone_number: restaurantData.phoneNumber,
                description: restaurantData.description,
                address: restaurantData.address,
                city: restaurantData.city,
                image_url: restaurantData.imageUrl || null
            }).select().single();
            throwSupabaseError(insertError, 'Account created, but restaurant profile could not be created.');
            return response({ restaurantId: restaurant.id, user: data.user });
        }

        return response({ user: data.user, requiresEmailConfirmation: true });
    },

    login: async (credentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.usernameOrEmail,
            password: credentials.password
        });
        throwSupabaseError(error, 'Invalid email or password.');

        let { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants').select('*').eq('auth_user_id', data.user.id).single();

        if (restaurantError) {
            const m = data.user.user_metadata || {};
            if (m.role === 'restaurant') {
                const insert = await supabase.from('restaurants').insert({
                    auth_user_id: data.user.id,
                    name: m.name || 'Restaurant',
                    email: data.user.email,
                    phone_number: m.phone_number || null,
                    description: m.description || null,
                    address: m.address || null,
                    city: m.city || null,
                    image_url: m.image_url || null
                }).select().single();
                throwSupabaseError(insert.error, 'Restaurant profile not found.');
                restaurant = insert.data;
            } else {
                throwSupabaseError(restaurantError, 'Restaurant profile not found.');
            }
        }

        return response({
            token: data.session?.access_token,
            restaurantId: restaurant.id,
            name: restaurant.name,
            restaurant: data.user
        });
    }
};
