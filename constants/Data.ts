import { Appointment, Community, CommunityPost, Doctor, Exercise } from './Types';

export const mockDoctors: Doctor[] = [
    {
        id: '1',
        name: 'Dr. Uwimana Marie',
        specialty: 'Clinical Psychologist',
        rating: 4.9,
        experience: 8,
        avatar: 'https://images.unsplash.com/photo-1594824475317-d0d4e0b0b5b5?w=150&h=150&fit=crop&crop=face',
        price: 25000, // RWF
        availability: ['Mon', 'Wed', 'Fri'],
        bio: 'Specialized in anxiety and depression treatment with over 8 years of experience. Fluent in Kinyarwanda, French, and English.',
        location: 'Kigali, Rwanda'
    },
    {
        id: '2',
        name: 'Dr. Nkurunziza Jean Baptiste',
        specialty: 'Psychiatrist',
        rating: 4.8,
        experience: 12,
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        price: 35000, // RWF
        availability: ['Tue', 'Thu', 'Sat'],
        bio: 'Expert in mood disorders and medication management. Specializes in trauma recovery and PTSD treatment.',
        location: 'Kigali, Rwanda'
    },
    {
        id: '3',
        name: 'Dr. Mukamana Grace',
        specialty: 'Therapist',
        rating: 4.7,
        experience: 6,
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
        price: 20000, // RWF
        availability: ['Mon', 'Tue', 'Thu'],
        bio: 'Focuses on cognitive behavioral therapy and stress management. Experienced in family counseling and youth mental health.',
        location: 'Kigali, Rwanda'
    },
    {
        id: '4',
        name: 'Dr. Habimana Paul',
        specialty: 'Counselor',
        rating: 4.6,
        experience: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        price: 18000, // RWF
        availability: ['Wed', 'Fri', 'Sat'],
        bio: 'Community mental health specialist with focus on addiction recovery and social reintegration programs.',
        location: 'Butare, Rwanda'
    },
    {
        id: '5',
        name: 'Dr. Nyirahabimana Alice',
        specialty: 'Child Psychologist',
        rating: 4.8,
        experience: 10,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        price: 30000, // RWF
        availability: ['Mon', 'Wed', 'Fri'],
        bio: 'Specialized in child and adolescent mental health. Expert in developmental disorders and behavioral therapy.',
        location: 'Kigali, Rwanda'
    },
    {
        id: '6',
        name: 'Dr. Mutabazi Emmanuel',
        specialty: 'Clinical Psychologist',
        rating: 4.7,
        experience: 9,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        price: 28000, // RWF
        availability: ['Mon', 'Thu', 'Sat'],
        bio: 'Specializes in trauma therapy and post-genocide healing. Expert in cultural therapy approaches for Rwandan communities.',
        location: 'Kigali, Rwanda'
    },
    {
        id: '7',
        name: 'Dr. Nyiramana Claudine',
        specialty: 'Family Therapist',
        rating: 4.9,
        experience: 11,
        avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
        price: 32000, // RWF
        availability: ['Tue', 'Wed', 'Fri'],
        bio: 'Family and couples therapy specialist. Focuses on strengthening family bonds and communication in Rwandan families.',
        location: 'Kigali, Rwanda'
    }
];

export const mockExercises: Exercise[] = [
    {
        id: '1',
        title: 'Deep Breathing',
        description: 'A simple breathing exercise to reduce stress and anxiety. Focus on slow, controlled breaths.',
        duration: 5,
        category: 'breathing',
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
    },
    {
        id: '2',
        title: 'Mindful Meditation',
        description: 'Practice mindfulness to improve focus and reduce stress. Observe your thoughts without judgment.',
        duration: 10,
        category: 'meditation',
        difficulty: 'intermediate',
        image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&h=200&fit=crop'
    },
    {
        id: '3',
        title: 'Progressive Relaxation',
        description: 'Systematic muscle relaxation technique. Tense and release each muscle group for deep relaxation.',
        duration: 15,
        category: 'relaxation',
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
    },
    {
        id: '4',
        title: 'Body Scan',
        description: 'Mindfulness practice focusing on body awareness. Notice sensations throughout your entire body.',
        duration: 20,
        category: 'mindfulness',
        difficulty: 'advanced',
        image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=300&h=200&fit=crop'
    },
    {
        id: '5',
        title: 'Box Breathing',
        description: 'Navy SEAL breathing technique for stress relief. Equal counts for inhale, hold, exhale, hold.',
        duration: 5,
        category: 'breathing',
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop'
    },
    {
        id: '6',
        title: 'Loving-Kindness Meditation',
        description: 'Cultivate compassion for yourself and others. Send positive wishes to yourself and loved ones.',
        duration: 15,
        category: 'meditation',
        difficulty: 'intermediate',
        image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=300&h=200&fit=crop'
    },
    {
        id: '7',
        title: '5-4-3-2-1 Grounding',
        description: 'Grounding technique using your five senses. Helps with anxiety and panic attacks.',
        duration: 10,
        category: 'mindfulness',
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=200&fit=crop'
    },
    {
        id: '8',
        title: 'Guided Visualization',
        description: 'Imagine a peaceful place to promote relaxation. Use all your senses to create a calming scene.',
        duration: 12,
        category: 'relaxation',
        difficulty: 'intermediate',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop'
    }
];

export const mockCommunities: Community[] = [
    {
        id: '1',
        name: 'Ubwoba Support (Anxiety)',
        description: 'Aho dusangira ubunyangamugayo no gufasha mu gukemura ubwoba',
        members: 850,
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop',
        isJoined: true
    },
    {
        id: '2',
        name: 'Mindfulness Rwanda',
        description: 'Kwihangana no gutekereza neza - Daily mindfulness practice',
        members: 620,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        isJoined: false
    },
    {
        id: '3',
        name: 'Kwicuza Recovery',
        description: 'Gufasha mu kwicuza no kongera ubuzima bwiza',
        members: 1200,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
        isJoined: true
    },
    {
        id: '4',
        name: 'Youth Mental Health',
        description: 'Supporting young people in Rwanda with mental health challenges',
        members: 950,
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop',
        isJoined: false
    }
];

export const mockPosts: CommunityPost[] = [
    {
        id: '1',
        author: 'Mukamana Vestine',
        avatar: 'https://images.unsplash.com/photo-1594824475317-d0d4e0b0b5b5?w=50&h=50&fit=crop&crop=face',
        content: 'Nagize ikiganiro cyiza na muganga wanjye uyu munsi. Ndumva nshimishijwe no gukemura ubwoba bwanjye. Wibuke, iterambere ntabwo rigenda rumwe! 💙 (Had a great session with my therapist today!)',
        timestamp: '2h ago',
        likes: 24,
        comments: 8,
        isLiked: false
    },
    {
        id: '2',
        author: 'Nkurunziza Pacifique',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: 'Just completed a 10-minute meditation session. Small steps, but they add up. Ni ibihe bikorwa byo kwihangana bikugufasha? What mindfulness practices work for you?',
        timestamp: '4h ago',
        likes: 18,
        comments: 12,
        isLiked: true
    },
    {
        id: '3',
        author: 'Uwimana Grace',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face',
        content: 'Sharing a breathing technique that helped me during anxiety yesterday. Breathe in for 4, hold for 4, out for 6. Ndizera ko bizafasha umuntu! Hope this helps! 🌸',
        timestamp: '6h ago',
        likes: 42,
        comments: 15,
        isLiked: true
    },
    {
        id: '4',
        author: 'Habimana Samuel',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: 'Mental health awareness is growing in Rwanda 🇷🇼. Let\'s continue supporting each other and breaking the stigma. Ubuzima bwo mu mutwe ni ingenzi!',
        timestamp: '8h ago',
        likes: 35,
        comments: 20,
        isLiked: false
    },
    {
        id: '5',
        author: 'Nyiramana Claudette',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=50&h=50&fit=crop&crop=face',
        content: 'Murakoze cyane kuri bose mufasha mu gukemura ibibazo by\'ubuzima bwo mu mutwe. Tuzongerane dufe atanye! Thank you for helping with mental health issues. Let\'s continue supporting each other! 🙏',
        timestamp: '1d ago',
        likes: 28,
        comments: 11,
        isLiked: false
    }
];

export const mockAppointments: Appointment[] = [
    {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Uwimana Marie',
        date: '2024-11-08',
        time: '10:00 AM',
        status: 'upcoming',
        type: 'video'
    },
    {
        id: '2',
        doctorId: '2',
        doctorName: 'Dr. Nkurunziza Jean',
        date: '2024-11-05',
        time: '2:00 PM',
        status: 'completed',
        type: 'in-person'
    },
    {
        id: '3',
        doctorId: '3',
        doctorName: 'Dr. Mukamana Grace',
        date: '2024-11-12',
        time: '3:00 PM',
        status: 'upcoming',
        type: 'video'
    },
    {
        id: '4',
        doctorId: '1',
        doctorName: 'Dr. Uwimana Marie',
        date: '2024-10-28',
        time: '11:00 AM',
        status: 'completed',
        type: 'video'
    }
];