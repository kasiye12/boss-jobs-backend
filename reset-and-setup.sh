#!/bin/bash

echo "🔄 Resetting and setting up Boss Jobs Ethiopia database..."
echo ""

# Stop server if running
pkill -f "nodemon" 2>/dev/null || true

echo "1️⃣ Dropping existing tables..."
node -e "
const { sequelize } = require('./src/models/index');
sequelize.sync({ force: true }).then(() => {
  console.log('   ✅ All tables dropped and recreated');
  process.exit(0);
}).catch(err => {
  console.error('   ❌ Error:', err.message);
  process.exit(1);
});
"

echo ""
echo "2️⃣ Creating tables with proper schema..."
node -e "
const { sequelize } = require('./src/models/index');
sequelize.sync({ alter: true }).then(() => {
  console.log('   ✅ Tables created successfully');
  process.exit(0);
}).catch(err => {
  console.error('   ❌ Error:', err.message);
  process.exit(1);
});
"

echo ""
echo "3️⃣ Verifying tables..."
PGPASSWORD=boss_jobs_2024 psql -h localhost -U boss_jobs_user -d boss_jobs_ethiopia << 'SQL'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
SQL

echo ""
echo "4️⃣ Seeding sample data..."
node -e "
const { User, JobSeekerProfile, Job, Application } = require('./src/models/index');

async function seed() {
  try {
    // Create admin
    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@bossjobs.et',
      phoneNumber: '+251911234567',
      passwordHash: 'Admin123!@#',
      role: 'admin'
    });
    console.log('   ✅ Admin created');

    // Create employer
    const employer = await User.create({
      fullName: 'EthioTech Solutions',
      email: 'hr@ethiotech.com',
      phoneNumber: '+251922345678',
      passwordHash: 'Employer123!@#',
      role: 'employer'
    });
    console.log('   ✅ Employer created');

    // Create job seeker
    const seeker = await User.create({
      fullName: 'Abebe Kebede',
      email: 'abebe@email.com',
      phoneNumber: '+251933456789',
      passwordHash: 'Seeker123!@#',
      role: 'job_seeker'
    });
    console.log('   ✅ Job seeker created');

    // Create job seeker profile
    await JobSeekerProfile.create({
      userId: seeker.id,
      title: 'Senior Software Developer',
      bio: 'Experienced developer with 5+ years in web development',
      skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL'],
      experienceJson: [{
        company: 'Tech Corp',
        position: 'Developer',
        startDate: '2019-01',
        endDate: '2024-01',
        description: 'Led development team'
      }],
      educationJson: [{
        institution: 'Addis Ababa University',
        degree: 'BSc Computer Science',
        graduationYear: 2018
      }],
      latitude: 9.0320,
      longitude: 38.7469,
      isProfileComplete: true
    });
    console.log('   ✅ Job seeker profile created');

    // Create sample jobs
    const jobs = [
      {
        employerId: employer.id,
        title: 'Senior React Developer',
        description: 'Looking for an experienced React developer for our Addis Ababa office.',
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
        description: 'Join our mobile team to build Flutter applications.',
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
        title: 'UI/UX Designer',
        description: 'Creative designer needed for our product team.',
        companyName: 'EthioTech Solutions',
        jobType: 'Remote',
        salaryRange: '20,000 - 30,000 ETB',
        requiredSkills: ['Figma', 'UI Design', 'User Research'],
        requiredExperience: 2
      }
    ];

    for (const job of jobs) {
      await Job.create(job);
    }
    console.log(`   ✅ ${jobs.length} jobs created`);

    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('📝 Test Accounts:');
    console.log('   Admin:    admin@bossjobs.et / Admin123!@#');
    console.log('   Employer: hr@ethiotech.com / Employer123!@#');
    console.log('   Seeker:   abebe@email.com / Seeker123!@#');
    console.log('');
    console.log('🚀 Run: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting server..."
npm run dev
