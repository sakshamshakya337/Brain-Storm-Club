export const EVENTS_DATA = [
  { 
    id: 1, 
    slug: 'ai-masterclass-neural-networks',
    title: 'AI Masterclass: Neural Networks', 
    category: 'WORKSHOP', 
    date: 'OCT 20, 2026', 
    time: '14:00', 
    venue: 'LAB 32', 
    status: 'ONGOING', 
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', 
    desc: 'Dive deep into neural network architectures and practical applications with industry experts.',
    overview: 'This masterclass is designed for students who want to move beyond the basics of AI. We will cover the foundational mathematics of neural networks, build simple models from scratch using Python, and deploy them on edge devices. Industry experts will lead the session, offering insights into how these models are used in modern tech companies.',
    highlights: [
      'Hands-on model building with PyTorch.',
      'Guest lecture from a Senior ML Engineer.',
      'Deployment of a computer vision model.'
    ]
  },
  { 
    id: 2, 
    slug: 'future-of-web3-seminar',
    title: 'Future of Web3 Seminar', 
    category: 'SEMINAR', 
    date: 'NOV 05, 2026', 
    time: '10:00', 
    venue: 'ONLINE', 
    status: 'UPCOMING', 
    img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070&auto=format&fit=crop', 
    desc: 'Understanding decentralized systems, smart contracts, and the next generation of the web.',
    overview: 'Web3 is reshaping how we think about data ownership, finance, and digital identity. This seminar breaks down the hype to focus on the underlying engineering principles of blockchains and smart contracts. We will explore Ethereum architecture, consensus mechanisms, and the basics of Solidity.',
    highlights: [
      'Deconstructing the Blockchain trilemma.',
      'Writing your first Smart Contract.',
      'Q&A panel on the future of decentralized finance.'
    ]
  },
  { 
    id: 3, 
    slug: 'founder-connect',
    title: 'Founder Connect', 
    category: 'MEETUP', 
    date: 'NOV 12, 2026', 
    time: '17:30', 
    venue: 'AUDITORIUM 1', 
    status: 'UPCOMING', 
    img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop', 
    desc: 'Meet successful student founders and venture capitalists in a casual networking environment.',
    overview: 'An exclusive networking evening connecting ambitious students with alumni founders who have successfully scaled their ideas into funded startups. Learn how to pitch, how to build an MVP quickly, and what investors are actually looking for in student-led ventures.',
    highlights: [
      'Fireside chat with recent alumni founders.',
      'Speed networking sessions.',
      'Mock pitch feedback.'
    ]
  },
  { 
    id: 4, 
    slug: 'winter-code-sprint',
    title: 'Winter Code Sprint', 
    category: 'CONTEST', 
    date: 'DEC 01, 2026', 
    time: '09:00', 
    venue: 'CAMPUS WIDE', 
    status: 'UPCOMING', 
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop', 
    desc: 'A competitive 24-hour coding challenge across multiple problem domains.',
    overview: 'Test your algorithmic thinking and software engineering skills in our flagship Winter Code Sprint. Compete individually or in teams of up to three to solve complex problems across web development, machine learning, and systems architecture. Significant prizes for the top teams.',
    highlights: [
      '24-hour continuous coding sprint.',
      'Multiple technical tracks (Web, AI, Systems).',
      'Over $5,000 in total prizes.'
    ]
  },
  {
    id: 5,
    slug: 'innovate-lpu-2026',
    title: 'INNOVATE LPU 2026',
    category: 'HACKATHON',
    date: 'OCT 15, 2026',
    time: '09:00 AM',
    venue: 'INNOVATION LAB, BLOCK 32',
    status: 'UPCOMING',
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
    desc: 'The ultimate 48-hour coding marathon. Build solutions that address real-world challenges using next-generation technologies. Over $5,000 in prizes.',
    overview: 'Innovate LPU is our largest hackathon of the year. Over 48 hours, teams will conceptualize, design, and build functioning prototypes that solve specific prompts provided by our industry partners. It is a grueling, exciting, and immensely rewarding experience for builders of all skill levels.',
    highlights: [
      '48-hour intensive building environment.',
      'Mentorship from industry professionals.',
      'Access to premium APIs and cloud credits.',
      'Final pitch to a panel of venture capitalists.'
    ]
  }
];

export const PAST_EVENTS = [
  { 
    id: 6,
    slug: 'summer-hackathon-2026',
    year: '2026', 
    date: 'AUG 10, 2026',
    time: '08:00 AM',
    title: 'Summer Hackathon', 
    category: 'HACKATHON', 
    status: 'COMPLETED',
    venue: 'MAIN HALL',
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
    desc: 'Over 300 students competed to build sustainable tech solutions in our annual summer marathon.',
    overview: 'The 2026 Summer Hackathon brought together the brightest minds across the university to tackle sustainability through software. Teams built projects ranging from smart grid analytics dashboards to peer-to-peer hardware recycling networks.',
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop'
    ]
  },
  { 
    id: 7,
    slug: 'react-performance-tuning',
    year: '2026', 
    date: 'JUL 22, 2026',
    time: '14:00',
    title: 'React Performance Tuning', 
    category: 'WORKSHOP', 
    status: 'COMPLETED',
    venue: 'LAB 12',
    img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    desc: 'An advanced technical workshop on memoization, concurrent rendering, and minimizing re-renders.',
    overview: 'This workshop went deep into the mechanics of React\'s rendering engine. Students learned how to profile applications, identify expensive renders, and utilize techniques like useMemo, useCallback, and virtualized lists to achieve 60fps performance on heavy web applications.'
  },
  { 
    id: 8,
    slug: 'cybersecurity-101',
    year: '2025', 
    date: 'NOV 15, 2025',
    time: '10:00',
    title: 'Cybersecurity 101', 
    category: 'SEMINAR', 
    status: 'COMPLETED',
    venue: 'AUDITORIUM 2',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    desc: 'A comprehensive introduction to network security, ethical hacking, and securing modern web applications.',
    overview: 'We covered the fundamentals of protecting infrastructure and user data. Topics included the OWASP Top 10, common injection vulnerabilities, setting up secure authentication flows, and basic penetration testing methodologies.'
  },
  { 
    id: 9,
    slug: 'cloud-architecture-design',
    year: '2025', 
    date: 'SEP 05, 2025',
    time: '11:00',
    title: 'Cloud Architecture Design', 
    category: 'WORKSHOP', 
    status: 'COMPLETED',
    venue: 'LAB 32',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    desc: 'Learning to build scalable, resilient systems on AWS and GCP through hands-on labs.',
    overview: 'Students designed and deployed a microservices architecture using Docker, Kubernetes, and managed cloud databases. The workshop emphasized high availability, load balancing, and infrastructure-as-code using Terraform.'
  },
  { 
    id: 10,
    slug: 'brainstorm-inauguration',
    year: '2025', 
    date: 'JAN 20, 2025',
    time: '18:00',
    title: 'Brainstorm Inauguration', 
    category: 'MEETUP', 
    status: 'COMPLETED',
    venue: 'MAIN AMPHITHEATER',
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
    desc: 'The official launch event of the Brainstorm Club, bringing together 500+ students and faculty.',
    overview: 'Our foundational event where the vision for Brainstorm was first shared. We introduced the core team, outlined our goals for building a premier tech community at LPU, and hosted lightning talks from prominent professors and industry partners.'
  },
];

export const ALL_EVENTS = [...EVENTS_DATA, ...PAST_EVENTS];

export const getEventBySlug = (slug) => {
  return ALL_EVENTS.find(event => event.slug === slug) || null;
};
