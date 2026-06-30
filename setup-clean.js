const { sequelize, User, JobSeekerProfile, Job, Application } = require('./src/models/index');

async function setup() {
  try {
    console.log('🔧 Setting up Boss Jobs Ethiopia database...\n');

    // Drop all tables in correct order
    console.log('1️⃣ Dropping existing tables...');
    await sequelize.query('DROP TABLE IF EXISTS applications CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS jobs CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS job_seeker_profiles CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('   ✅ All tables dropped\n');

    // Create tables in correct order
    console.log('2️⃣ Creating tables...');
    await User.sync({ force: true });
    console.log('   ✅ Users table created');
    
    await JobSeekerProfile.sync({ force: true });
    console.log('   ✅ Job Seeker Profiles table created');
    
    await Job.sync({ force: true });
    console.log('   ✅ Jobs table created');
    
    await Application.sync({ force: true });
    console.log('   ✅ Applications table created\n');

    // Seed data
    console.log('3️⃣ Seeding sample data...');
    
    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@bossjobs.et',
      phoneNumber: '+251911234567',
      passwordHash: 'Admin123!@#',
      role: 'admin'
    });
    console.log('   ✅ Admin created');

    const employer = await User.create({
      fullName: 'EthioTech Solutions',
      email: 'hr@ethiotech.com',
      phoneNumber: '+251922345678',
      passwordHash: 'Employer123!@#',
      role: 'employer'
    });
    console.log('   ✅ Employer created');

    const seeker = await User.create({
      fullName: 'Abebe Kebede',
      email: 'abebe@email.com',
      phoneNumber: '+251933456789',
      passwordHash: 'Seeker123!@#',
      role: 'job_seeker'
    });
    console.log('   ✅ Job seeker created');

    await JobSeekerProfile.create({
      userId: seeker.id,
      title: 'Senior Software Developer',
      bio: 'Experienced software developer with 5+ years in web and mobile development.',
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
          degree: 'BSc Computer Science',
          graduationYear: 2018
        }
      ],
      latitude: 9.0320,
      longitude: 38.7469,
      isProfileComplete: true
    });
    console.log('   ✅ Profile created');

    const job1 = await Job.create({
      employerId: employer.id,
      title: 'Senior React Developer',
      description: 'Join our team in Addis Ababa to build modern web applications for Ethiopian businesses. We offer competitive salary and great working environment.',
      companyName: 'EthioTech Solutions',
      jobType: 'Full-time',
      salaryRange: '30,000 - 45,000 ETB',
      latitude: 9.0320,
      longitude: 38.7469,
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Redux'],
      requiredExperience: 3,
      isFeatured: true,
      vacanciesCount: 2
    });
    console.log(`   ✅ Job created: ${job1.title}`);

    const job2 = await Job.create({
      employerId: employer.id,
      title: 'Mobile App Developer',
      description: 'Build innovative Flutter applications for Android and iOS platforms. Work on exciting projects for the Ethiopian market.',
      companyName: 'EthioTech Solutions',
      jobType: 'Contract',
      salaryRange: '25,000 - 35,000 ETB',
      latitude: 9.0100,
      longitude: 38.7600,
      requiredSkills: ['Flutter', 'Dart', 'Firebase'],
      requiredExperience: 2,
      vacanciesCount: 3
    });
    console.log(`   ✅ Job created: ${job2.title}`);

    const job3 = await Job.create({
      employerId: employer.id,
      title: 'Backend Developer (Node.js)',
      description: 'Looking for an experienced Node.js developer to build scalable APIs and microservices for our platform.',
      companyName: 'EthioTech Solutions',
      jobType: 'Full-time',
      salaryRange: '35,000 - 50,000 ETB',
      latitude: 9.0320,
      longitude: 38.7469,
      requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
      requiredExperience: 4,
      isFeatured: true
    });
    console.log(`   ✅ Job created: ${job3.title}`);

    const job4 = await Job.create({
      employerId: employer.id,
      title: 'UI/UX Designer',
      description: 'Creative designer needed to craft beautiful and intuitive user interfaces for our products.',
      companyName: 'EthioTech Solutions',
      jobType: 'Remote',
      salaryRange: '20,000 - 30,000 ETB',
      requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
      requiredExperience: 2
    });
    console.log(`   ✅ Job created: ${job4.title}\n`);

    // Verify
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    
    console.log('📊 Tables in database:');
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
    
    console.log('\n🎉 Setup complete!');
    console.log('\n📝 Test Accounts:');
    console.log('┌──────────┬─────────────────────┬────────────────┐');
    console.log('│ Role     │ Email               │ Password       │');
    console.log('├──────────┼─────────────────────┼────────────────┤');
    console.log('│ Admin    │ admin@bossjobs.et   │ Admin123!@#    │');
    console.log('│ Employer │ hr@ethiotech.com    │ Employer123!@# │');
    console.log('│ Seeker   │ abebe@email.com     │ Seeker123!@#   │');
    console.log('└──────────┴─────────────────────┴────────────────┘');
    console.log('\n🚀 Run: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

setup();
