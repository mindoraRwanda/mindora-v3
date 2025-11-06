export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    experience: number;
    avatar: string;
    price: number;
    availability: string[];
    bio: string;
    location: string;
}

export interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    type: 'video' | 'in-person';
}

export interface Exercise {
    id: string;
    title: string;
    description: string;
    duration: number;
    category: 'breathing' | 'meditation' | 'mindfulness' | 'relaxation';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    image: string;
}

export interface CommunityPost {
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLiked: boolean;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    members: number;
    image: string;
    isJoined: boolean;
}