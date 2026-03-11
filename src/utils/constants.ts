import mentorImgUiUx from '../assets/homePage/explore1.webp';
import mentorImgReact from '../assets/homePage/ask.webp';
import mentorImgMl from '../assets/homePage/aboutus3.webp';
import mentorImgFullstack from '../assets/homePage/aboutus2.webp';
import avatarDavid from '../assets/homePage/person1.webp';
import avatarSarah from '../assets/homePage/person2.webp';
import avatarKumar from '../assets/homePage/person3.webp';
import avatarJohn from '../assets/homePage/person4.webp';
import aboutUs1 from '../assets/homePage/aboutus1.webp';
import aboutUs2 from '../assets/homePage/aboutus2.webp';
import aboutUs3 from '../assets/homePage/aboutus3.webp';
import blog1 from '../assets/homePage/blog1.webp';

export const TEXTS = {
  heroTitle: 'Learn.Mentor. Grow',
  heroSubtitle: 'Join a community where mentors share experience and students grow with real-world guidance',
  joinMeta: 'Join 1,000 mentors and students'
};

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

export const MENTORSHIPS = [
  { title: 'Mastering UI/UX Design: From Concept Prototype', image: mentorImgUiUx, rating: 4.9, reviews: 328, price: 250, instructor: 'David Hall', avatar: avatarDavid, category: 'UI/UX' },
  { title: 'Advanced React & Next.js Patterns', image: mentorImgReact, rating: 4.8, reviews: 450, price: 299, instructor: 'Sarah Chen', avatar: avatarSarah, category: 'Frontend' },
  { title: 'Machine Learning Fundamentals', image: mentorImgMl, rating: 4.9, reviews: 512, price: 320, instructor: 'Prof. Kumar', avatar: avatarKumar, category: 'Machine Learning' },
  { title: 'Full Stack Web Development', image: mentorImgFullstack, rating: 4.7, reviews: 289, price: 280, instructor: 'John Doe', avatar: avatarJohn, category: 'Full Stack' },
  { title: 'Full Stack Web Development', image: mentorImgFullstack, rating: 4.7, reviews: 289, price: 280, instructor: 'John Doe', avatar: avatarJohn, category: 'Full Stack' },

];

// Using string-based icon names
export const ABOUT_STATS = [
  { icon: 'Star', value: '98%', label: 'Success Rate' },
  { icon: 'Users', value: '15,000+', label: 'Active Students' },
  { icon: 'BookOpen', value: '500+', label: 'Courses' },
  { icon: 'Check', value: '150+', label: 'Expert Instructors' },
];

export const ABOUT_IMAGES = [
  aboutUs3,
  aboutUs1,
  aboutUs2,
  aboutUs1,
];



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
    imageSrc: blog1,
    date: 'May 01, 2026',
    comments: 10,
    title: 'How Mentorship Can Fast-Track',
    description: 'Discover how learning from real mentors helps students build practical skills and enter the tech industry with confidence.',
  },
  {
    imageSrc: blog1,
    date: 'May 01, 2026',
    comments: 10,
    title: 'How Mentorship Can Fast-Track',
    description: 'Discover how learning from real mentors helps students build practical skills and enter the tech industry with confidence.',
  },
  {
    imageSrc: blog1,
    date: 'May 01, 2026',
    comments: 10,
    title: 'How Mentorship Can Fast-Track',
    description: 'Discover how learning from real mentors helps students build practical skills and enter the tech industry with confidence.',
  },
];


export const TESTIMONIALS_DATA = [
  { quote: "you only have to know one thing, that you can learn anything. Anytime, anywhere to do you discover yourself. Our content will help you every step.", name: "Jheny William", role: "Mentor", image: 'https://i.pravatar.cc/150?img=1' },
  { quote: "you only have to know one thing, that you can learn anything. Anytime, anywhere to do you discover yourself. Our content will help you every step.", name: "Jheny William", role: "Student", image: 'https://i.pravatar.cc/150?img=2' },
  { quote: "you only have to know one thing, that you can learn anything. Anytime, anywhere to do you discover yourself. Our content will help you every step.", name: "Jheny William", role: "Student", image: 'https://i.pravatar.cc/150?img=3' },
];

export const FAQ_ITEMS = [
  { id: 1, question: 'How can I become a mentor on the platform?', answer: 'To become a mentor, you need to have specialized experience in an IT field (usually 5+ years) and pass a short screening interview. You can apply through the "Become a Mentor" section on the website.' },
  { id: 2, question: 'Is joining the mentorship program free for students?', answer: 'The core mentorship program is offered free of charge to all registered students. However, some specialized one-on-one sessions may require a small fee.' },
  { id: 3, question: 'Can I enroll in more than one mentorship at the same time?', answer: 'Yes, students are allowed to enroll in up to two different mentorship tracks simultaneously, provided the schedules do not conflict.' },
  { id: 4, question: 'How do mentorship sessions work?', answer: 'Sessions typically run for one hour, held twice weekly via video call. Mentors provide practical tasks, code reviews, and career guidance.' },
  { id: 5, question: 'What if I face technical issues or need help?', answer: 'We have a dedicated 24/7 technical support team. You can contact them directly via live chat or through the support ticket system in your dashboard.' },
];
