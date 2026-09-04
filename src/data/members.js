export const TEAM_MEMBERS = [
  {
    id: 1,
    slug: 'dr-john-doe',
    regNo: '12200001',
    name: 'Dr. John Doe',
    role: 'Head of School',
    group: 'LEADERSHIP',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    slug: 'prof-jane-smith',
    regNo: '12200002',
    name: 'Prof. Jane Smith',
    role: 'Faculty Advisor',
    group: 'LEADERSHIP',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    slug: 'alex-johnson',
    name: 'Alex Johnson',
    role: 'President',
    course: 'BCA/MCA',
    group: 'CORE TEAM',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 4,
    slug: 'maria-garcia',
    name: 'Maria Garcia',
    role: 'Vice President',
    course: 'B.Tech IT',
    group: 'CORE TEAM',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 5,
    slug: 'sam-wilson',
    name: 'Sam Wilson',
    role: 'Event Coordinator',
    course: 'BCA',
    group: 'COORDINATORS',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 6,
    slug: 'linda-chen',
    name: 'Linda Chen',
    role: 'PR Coordinator',
    course: 'BBA',
    group: 'COORDINATORS',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  }
];

export const getMemberBySlug = (slug) => {
  return TEAM_MEMBERS.find(member => member.slug === slug) || null;
};
