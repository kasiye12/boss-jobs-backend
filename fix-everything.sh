#!/bin/bash

echo "🔧 Fixing Boss Jobs Ethiopia..."
echo ""

# Kill existing processes
echo "1️⃣ Stopping existing processes..."
pkill -f nodemon 2>/dev/null
pkill -f "node src/server" 2>/dev/null
sleep 2

# Free up port 3000
echo "2️⃣ Freeing up port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# Clean database
echo "3️⃣ Cleaning database..."
PGPASSWORD=boss_jobs_2024 psql -h localhost -U boss_jobs_user -d boss_jobs_ethiopia << 'SQL'
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS job_seeker_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS app_status CASCADE;
SQL
echo "   ✅ Database cleaned"

# Run migration
echo ""
echo "4️⃣ Creating tables..."
node -e "
const { sequelize, User, JobSeekerProfile, Job, Application } = require('./src/models/index');

async function setup() {
  try {
    // Create tables in order
    await User.sync({ force: true });
    console.log('   ✅ Users table');
    
    await JobSeekerProfile.sync({ force: true });
    console.log('   ✅ Job Seeker Profiles table');
    
    await Job.sync({ force: true });
    console.log('   ✅ Jobs table');
    
    await Application.sync({ force: true });
    console.log('   ✅ Applications table');
    
    // Create sample data
    console.log('');
    console.log('5️⃣ Seeding data...');
    
    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@bossjobs.et',
      phoneNumber: '+251911234567',
      passwordHash: 'Admin123!@#',
      role: 'admin'
    });
    
    const employer = await User.create({
      fullName: 'EthioTech Solutions',
      email: 'hr@ethiotech.com',
      phoneNumber: '+251922345678',
      passwordHash: 'Employer123!@#',
      role: 'employer'
    });
    
    const seeker = await User.create({
      fullName: 'Abebe Kebede',
      email: 'abebe@email.com',
      phoneNumber: '+251933456789',
      passwordHash: 'Seeker123!@#',
      role: 'job_seeker'
    });
    
    await JobSeekerProfile.create({
      userId: seeker.id,
      title: 'Senior Software Developer',
      bio: 'Experienced developer',
      skills: ['JavaScript', 'Node.js', 'React'],
      experienceJson: [{
        company: 'Tech Corp',
        position: 'Developer',
        startDate: '2019-01',
        endDate: '2024-01'
      }],
      educationJson: [{
        institution: 'AAU',
        degree: 'BSc CS',
        graduationYear: 2018
      }],
      latitude: 9.0320,
      longitude: 38.7469,
      isProfileComplete: true
    });
    
    await Job.create({
      employerId: employer.id,
      title: 'Senior React Developer',
      description: 'Join our team in Addis Ababa',
      companyName: 'EthioTech Solutions',
      jobType: 'Full-time',
      salaryRange: '30,000 - 45,000 ETB',
      latitude: 9.0320,
      longitude: 38.7469,
      requiredSkills: ['React', 'JavaScript'],
      requiredExperience: 3
    });
    
    await Job.create({
      employerId: employer.id,
      title: 'Mobile Developer',
      description: 'Build Flutter apps',
      companyName: 'EthioTech Solutions',
      jobType: 'Contract',
      salaryRange: '25,000 - 35,000 ETB',
      requiredSkills: ['Flutter', 'Dart'],
      requiredExperience: 2
    });
    
    console.log('   ✅ Sample data created');
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('📝 Accounts:');
    console.log('   Admin:    admin@bossjobs.et / Admin123!@#');
    console.log('   Employer: hr@ethiotech.com / Employer123!@#');
    console.log('   Seeker:   abebe@email.com / Seeker123!@#');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setup();
"

echo ""
echo "6️⃣ Starting server..."
npm run dev
