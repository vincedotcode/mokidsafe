export type Data = {
  id: number;
  image: any;
  title: string;
  text: string;
};

export const data: Data[] = [
  {
    id: 1,
    image: require('../assets/onboarding/image1.png'), // Update with your actual image path
    title: 'Track Your Child’s Safety',
    text: 'Stay updated on your child’s location in real-time with our GPS tracking and geofencing features, ensuring their safety at all times.',
  },
  {
    id: 2,
    image: require('../assets/onboarding/image2.png'), // Update with your actual image path
    title: 'Instant SOS Alerts',
    text: 'Receive instant SOS alerts during emergencies. Your child can notify you with just one tap, giving you peace of mind.',
  },
  {
    id: 3,
    image: require('../assets/onboarding/image3.png'), // Update with your actual image path
    title: 'Monitor Screen Time',
    text: 'Encourage healthy device usage by monitoring and managing your child’s screen time directly through our app.',
  },
];
