import aboutUs1 from '../assets/homePage/about/Seminar-amico.svg';
import aboutUs2 from '../assets/homePage/about/Studying-amico.svg';
import aboutUs3 from '../assets/homePage/about/Remote meeting-rafiki.svg';
import blog1 from '../assets/homePage/blog/Blog post-bro.svg';
import blog2 from '../assets/homePage/blog/Education-rafiki.svg';
import blog3 from '../assets/homePage/blog/Programming-amico.svg';
import blog4 from '../assets/homePage/blog/UI-UX differences-rafiki.svg';

export const COLORS = {
  primary: 'text-[#0f5e8b]',
  primaryBg: 'bg-[#0f5e8b]'
};

// Using string-based icon names for dynamic lookup
export const SERVICES = {
  mentors: [
    { icon: 'Users', title: 'Manage Students Efficiently', desc: 'Track your mentees\' progress, review submissions, and provide instant feedback from your dashboard.' },
    { icon: 'BookOpen', title: 'Create Mentorship Programs', desc: 'Design and publish mentorships easily — add descriptions, materials, quizzes, and assignments.' },
    { icon: 'Calendar', title: 'Flexible Schedule', desc: 'Organize your mentorship sessions according to your availability and connect with students globally.' },
    { icon: 'ArrowRightLeft', title: 'Build a Professional Brand', desc: 'Showcase your experience and achievements to grow your visibility in the community.' },
  ],
  students: [
    { icon: 'Route', title: 'Skill-Based Learning Paths', desc: 'Access curated courses and quizzes that strengthen your technical and soft skills step by step.' },
    { icon: 'Users', title: 'Personalized Mentorships', desc: 'Get matched with mentors who align with your goals, skills, and learning pace.' },
    { icon: 'TrendingUp', title: 'Progress Tracking', desc: 'Monitor your improvement with detailed feedback and analytics after each session or assignment.' },
    { icon: 'Briefcase', title: 'Career Guidance', desc: 'Receive expert advice on how to advance your career and land opportunities in your chosen field.' },
  ]
};

// Using string-based icon names
export const ABOUT_STATS = [
  { icon: 'Star', value: '98%', label: 'Success Rate' },
  { icon: 'Users', value: '15,000+', label: 'Active Students' },
  { icon: 'BookOpen', value: '500+', label: 'Courses' },
  { icon: 'Check', value: '150+', label: 'Expert Instructors' },
] as Array<{ icon: 'Users' | 'BookOpen' | 'Star' | 'Check'; value: string; label: string }>;




//  images
export const ABOUT_IMAGES = [
  aboutUs3,
  aboutUs1,
  aboutUs2,
  aboutUs1,
];


//  why choose us
export const WHY_CHOOSE_US_FEATURES = [
  {
    title: 'Why Choose us?',
    description: 'We provide you with the best digital learning experience',
    icon: 'Laptop',
    isIntro: true,
  },
  {
    title: 'Diverse Courses',
    description: 'Access the best training courses in various technical and creative fields',
    icon: 'BookOpen',
  },
  {
    title: 'Professional Instructors',
    description: 'Learn from specialized experts with extensive practical experience',
    icon: 'Users',
  },
  {
    title: 'Certified Programs',
    description: 'Earn recognized certificates upon successful completion of courses',
    icon: 'Trophy',
  },
];

// blog
 export const dummyBlogs = [
  {
    imageSrc: blog1,
    date: 'May 01, 2026',
    comments: 10,
    title: 'How Mentorship Can Fast-Track',
    description: 'Discover how learning from real mentors helps students build practical skills and enter the tech industry with confidence.',
  },
{
    imageSrc: blog2,
    date: 'May 12, 2026',
    comments: 7,
    title: 'Bridging the Gap Between College and Code',
    description: 'Explore why standard university curricula often leave IT students scrambling and how working on practical, hands-on projects makes you job-ready.',
  },
  {
    imageSrc: blog3,
    date: 'May 18, 2026',
    comments: 14,
    title: 'The Art of Code Review in Team Projects',
    description: "Discover how collaborating effectively on shared repositories and reviewing your peers' code accelerates your growth as a developer.",
  },
  {
    imageSrc: blog4,
    date: 'May 24, 2026',
    comments: 5,
    title: 'Why UI/UX Matters for Modern Web Apps',
    description: 'Learn how adopting a minimalist, clean design approach can significantly elevate the user experience and value of your digital products.',
  },
];

// testimonials
export const TESTIMONIALS_DATA = [
  {
    quote: "Guiding students here is deeply rewarding. The platform makes it seamless to share engineering insights and bridge the gap between theory and industry reality.",
    name: "Elsayed Elsadek",
    role: "Senior Full-Stack Mentor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    quote: "Navigating complex backend architectures alone was tough. Having a dedicated mentor to review my code and guide my roadmap completely transformed my career preparation.",
    name: "Omar El-Farouk",
    role: "Computer Science Student",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    quote: "The structured mentorship here is unmatched. It's inspiring to work with ambitious future engineers eager to master modern tech stacks and real-world workflows.",
    name: "Sarah Jenkins",
    role: "Tech Lead & Mentor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
  }
];


// faq
export const FAQ_ITEMS = [
  { id: 1, question: 'How can I become a mentor on the platform?', answer: 'To become a mentor, you need to have specialized experience in an IT field (usually 5+ years) and pass a short screening interview. You can apply through the "Become a Mentor" section on the website.' },
  { id: 2, question: 'Is joining the mentorship program free for students?', answer: 'The core mentorship program is offered free of charge to all registered students. However, some specialized one-on-one sessions may require a small fee.' },
  { id: 3, question: 'Can I enroll in more than one mentorship at the same time?', answer: 'Yes, students are allowed to enroll in up to two different mentorship tracks simultaneously, provided the schedules do not conflict.' },
  { id: 4, question: 'How do mentorship sessions work?', answer: 'Sessions typically run for one hour, held twice weekly via video call. Mentors provide practical tasks, code reviews, and career guidance.' },
  { id: 5, question: 'What if I face technical issues or need help?', answer: 'We have a dedicated 24/7 technical support team. You can contact them directly via live chat or through the support ticket system in your dashboard.' },
];
