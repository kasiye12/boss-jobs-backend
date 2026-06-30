const { sequelize, User, JobSeekerProfile, Job } = require('../models/index');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('');

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   To reseed: npm run db:reset && npm run db:seed');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@bossjobs.et',
      phoneNumber: '+251911234567',
      passwordHash: 'Admin123!@#',
      role: 'admin',
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@bossjobs.et');
    console.log('   Password: Admin123!@#');
    console.log('');

    // Create employer
    const employer = await User.create({
      fullName: 'EthioTech Solutions HR',
      email: 'hr@ethiotech.com',
      phoneNumber: '+251922345678',
      passwordHash: 'Employer123!@#',
      role: 'employer',
    });
    console.log('✅ Employer created');
    console.log('   Email: hr@ethiotech.com');
    console.log('   Password: Employer123!@#');
    console.log('');

    // Create job seeker
    const seeker = await User.create({
      fullName: 'Abebe Kebede',
      email: 'abebe@email.com',
      phoneNumber: '+251933456789',
      passwordHash: 'Seeker123!@#',
      role: 'job_seeker',
    });
    console.log('✅ Job seeker created');
    console.log('   Email: abebe@email.com');
    console.log('   Password: Seeker123!@#');
    console.log('');

    // Create job seeker profile
    await JobSeekerProfile.create({
      userId: seeker.id,
      title: 'Senior Software Developer',
      bio: 'Experienced software developer with 5+ years in web and mobile application development. Passionate about building scalable solutions for the Ethiopian market.',
      skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL', 'Python', 'Docker'],
      experienceJson: [
        {
          company: 'Tech Corp Ethiopia',
          position: 'Senior Software Developer',
          startDate: '2020-01',
          endDate: '2024-01',
          description: 'Led development of multiple web applications serving Ethiopian businesses',
          highlights: ['Managed team of 5 developers', 'Reduced application load time by 40%']
        },
        {
          company: 'Digital Ethiopia',
          position: 'Software Developer',
          startDate: '2018-06',
          endDate: '2019-12',
          description: 'Developed mobile and web applications for various clients',
          highlights: ['Built 3 major client projects', 'Introduced agile methodologies']
        }
      ],
      educationJson: [
        {
          institution: 'Addis Ababa University',
          degree: 'Bachelor of Science in Computer Science',
          field: 'Computer Science',
          graduationYear: 2018,
          gpa: '3.7'
        }
      ],
      latitude: 9.0320,
      longitude: 38.7469,
      preferredJobTypes: ['Full-time', 'Remote', 'Contract'],
      expectedSalaryRange: '40,000 - 60,000 ETB',
      availabilityStatus: 'immediate',
      yearsOfExperience: 5,
      isProfileComplete: true,
    });
    console.log('✅ Job seeker profile created');
    console.log('');

    // Create sample jobs
    const sampleJobs = [
      {
        employerId: employer.id,
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team in Addis Ababa. You will be building modern web applications for our clients across Ethiopia. The ideal candidate has strong experience with React ecosystem and state management.',
        companyName: 'EthioTech Solutions',
        jobType: 'Full-time',
        salaryRange: '30,000 - 45,000 ETB',
        latitude: 9.0320,
        longitude: 38.7469,
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Redux'],
        requiredExperience: 3,
        vacanciesCount: 2,
        isFeatured: true,
      },
      {
        employerId: employer.id,
        title: 'Mobile App Developer (Flutter)',
        description: 'Join our mobile development team to create innovative Android and iOS applications for the Ethiopian market. We are building next-generation mobile solutions for banking, e-commerce, and service delivery.',
        companyName: 'EthioTech Solutions',
        jobType: 'Contract',
        salaryRange: '25,000 - 35,000 ETB',
        latitude: 9.0100,
        longitude: 38.7600,
        requiredSkills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
        requiredExperience: 2,
        vacanciesCount: 3,
      },
      {
        employerId: employer.id,
        title: 'UI/UX Designer',
        description: 'We need a creative UI/UX designer to design beautiful and intuitive interfaces for our products. You will work closely with developers and product managers to create user-centered designs.',
        companyName: 'EthioTech Solutions',
        jobType: 'Remote',
        salaryRange: '20,000 - 30,000 ETB',
        requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
        requiredExperience: 2,
      },
      {
        employerId: employer.id,
        title: 'Backend Developer (Node.js)',
        description: 'Looking for a Node.js backend developer with experience in building scalable APIs and microservices. You will be working on our core platform serving thousands of Ethiopian businesses.',
        companyName: 'EthioTech Solutions',
        jobType: 'Full-time',
        salaryRange: '35,000 - 50,000 ETB',
        latitude: 9.0320,
        longitude: 38.7469,
        requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
        requiredExperience: 4,
        vacanciesCount: 1,
        isFeatured: true,
      },
      {
        employerId: employer.id,
        title: 'Data Analyst',
        description: 'We are seeking a data analyst to help us make data-driven decisions. You will analyze user behavior, market trends, and business metrics to drive our product strategy.',
        companyName: 'EthioTech Solutions',
        jobType: 'Full-time',
        salaryRange: '25,000 - 40,000 ETB',
        latitude: 9.0220,
        longitude: 38.7469,
        requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Excel'],
        requiredExperience: 2,
      }
    ];

    for (const jobData of sampleJobs) {
      await Job.create(jobData);
    }
    console.log(`✅ ${sampleJobs.length} sample jobs created`);
    console.log('');

    console.log('🌱 Database seeded successfully!');
    console.log('');
    console.log('📝 Test Accounts:');
    console.log('┌──────────┬─────────────────────┬──────────────────┐');
    console.log('│ Role     │ Email               │ Password         │');
    console.log('├──────────┼─────────────────────┼──────────────────┤');
    console.log('│ Admin    │ admin@bossjobs.et   │ Admin123!@#      │');
    console.log('│ Employer │ hr@ethiotech.com    │ Employer123!@#   │');
    console.log('│ Seeker   │ abebe@email.com     │ Seeker123!@#     │');
    console.log('└──────────┴─────────────────────┴──────────────────┘');
    console.log('');
    console.log('🚀 Start the server: npm run dev');
    console.log('📍 API Base URL: http://localhost:3000/api/v1');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

seed();
