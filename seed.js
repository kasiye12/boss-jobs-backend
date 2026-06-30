const { User, JobSeekerProfile, Job } = require('./src/models/index');

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    console.log('');

    // Create admin
    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@bossjobs.et',
      phoneNumber: '+251911234567',
      passwordHash: 'Admin123!@#',
      role: 'admin'
    });
    console.log('✅ Admin created: admin@bossjobs.et / Admin123!@#');

    // Create employer
    const employer = await User.create({
      fullName: 'EthioTech Solutions',
      email: 'hr@ethiotech.com',
      phoneNumber: '+251922345678',
      passwordHash: 'Employer123!@#',
      role: 'employer'
    });
    console.log('✅ Employer created: hr@ethiotech.com / Employer123!@#');

    // Create job seeker
    const seeker = await User.create({
      fullName: 'Abebe Kebede',
      email: 'abebe@email.com',
      phoneNumber: '+251933456789',
      passwordHash: 'Seeker123!@#',
      role: 'job_seeker'
    });
    console.log('✅ Job seeker created: abebe@email.com / Seeker123!@#');

    // Create job seeker profile
    await JobSeekerProfile.create({
      userId: seeker.id,
      title: 'Senior Software Developer',
      bio: 'Experienced software developer with 5+ years in web development. Passionate about building solutions for Ethiopian businesses.',
      skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL', 'Python'],
      experienceJson: [
        {
          company: 'Tech Corp Ethiopia',
          position: 'Senior Developer',
          startDate: '2019-01',
          endDate: '2024-01',
          description: 'Led development of web applications'
        }
      ],
      educationJson: [
        {
          institution: 'Addis Ababa University',
          degree: 'BSc in Computer Science',
          graduationYear: 2018
        }
      ],
      latitude: 9.0320,
      longitude: 38.7469,
      isProfileComplete: true
    });
    console.log('✅ Job seeker profile created');

    // Create jobs
    const jobData = [
      {
        employerId: employer.id,
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team in Addis Ababa. Build modern web applications for Ethiopian clients.',
        companyName: 'EthioTech Solutions',
        jobType: 'Full-time',
        salaryRange: '30,000 - 45,000 ETB',
        latitude: 9.0320,
        longitude: 38.7469,
        requiredSkills: ['React', 'JavaScript', 'TypeScript'],
        requiredExperience: 3,
        isFeatured: true,
        vacanciesCount: 2
      },
      {
        employerId: employer.id,
        title: 'Mobile App Developer',
        description: 'Join our mobile development team to create Flutter applications for Android and iOS.',
        companyName: 'EthioTech Solutions',
        jobType: 'Contract',
        salaryRange: '25,000 - 35,000 ETB',
        latitude: 9.0100,
        longitude: 38.7600,
        requiredSkills: ['Flutter', 'Dart', 'Firebase'],
        requiredExperience: 2,
        vacanciesCount: 3
      },
      {
        employerId: employer.id,
        title: 'Backend Developer',
        description: 'Looking for a Node.js backend developer to build scalable APIs.',
        companyName: 'EthioTech Solutions',
        jobType: 'Full-time',
        salaryRange: '35,000 - 50,000 ETB',
        latitude: 9.0320,
        longitude: 38.7469,
        requiredSkills: ['Node.js', 'PostgreSQL', 'Docker'],
        requiredExperience: 4,
        isFeatured: true
      }
    ];

    for (const data of jobData) {
      const job = await Job.create(data);
      console.log(`✅ Job created: ${job.title}`);
    }

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📝 Test Accounts:');
    console.log('┌──────────┬─────────────────────┬────────────────┐');
    console.log('│ Role     │ Email               │ Password       │');
    console.log('├──────────┼─────────────────────┼────────────────┤');
    console.log('│ Admin    │ admin@bossjobs.et   │ Admin123!@#    │');
    console.log('│ Employer │ hr@ethiotech.com    │ Employer123!@# │');
    console.log('│ Seeker   │ abebe@email.com     │ Seeker123!@#   │');
    console.log('└──────────┴─────────────────────┴────────────────┘');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

seed();
