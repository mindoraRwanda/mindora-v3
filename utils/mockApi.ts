// Mock API functions for the Mindora app
// In a real app, these would make actual API calls

export const mockApi = {
    // Authentication
    login: async (email: string, password: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        id: '1',
                        name: 'Sarah Johnson',
                        email: email,
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                    }
                });
            }, 1000);
        });
    },

    signup: async (name: string, email: string, password: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        id: '1',
                        name: name,
                        email: email,
                        avatar: null
                    }
                });
            }, 1000);
        });
    },

    // Doctors
    getDoctors: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    doctors: []
                });
            }, 500);
        });
    },

    // Appointments
    bookAppointment: async (doctorId: string, date: string, time: string, type: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    appointment: {
                        id: Date.now().toString(),
                        doctorId,
                        date,
                        time,
                        type,
                        status: 'upcoming'
                    }
                });
            }, 1000);
        });
    },

    // Community
    createPost: async (content: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    post: {
                        id: Date.now().toString(),
                        content,
                        author: 'You',
                        timestamp: 'now',
                        likes: 0,
                        comments: 0,
                        isLiked: false
                    }
                });
            }, 500);
        });
    },

    // Exercises
    startExercise: async (exerciseId: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    session: {
                        id: Date.now().toString(),
                        exerciseId,
                        startTime: new Date().toISOString(),
                        status: 'active'
                    }
                });
            }, 300);
        });
    }
};