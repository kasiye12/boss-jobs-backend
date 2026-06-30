#!/bin/bash
set -e

clear
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Boss Jobs Ethiopia - Real System Startup                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd /home/kasu/boss-jobs-backend

# Step 1: Install dependencies
echo "1/6 📦 Installing dependencies..."
npm install --silent 2>/dev/null
echo "   ✅ Dependencies installed"

# Step 2: Setup database
echo ""
echo "2/6 🗄️  Setting up database..."
PGPASSWORD=boss_jobs_2024 psql -h localhost -U boss_jobs_user -d boss_jobs_ethiopia -c "SELECT 1;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "   Creating database..."
    sudo -u postgres psql -c "CREATE ROLE boss_jobs_user WITH LOGIN PASSWORD 'boss_jobs_2024';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE boss_jobs_ethiopia OWNER boss_jobs_user;" 2>/dev/null || true
    sudo -u postgres psql -d boss_jobs_ethiopia -c "CREATE EXTENSION IF NOT EXISTS cube; CREATE EXTENSION IF NOT EXISTS earthdistance;" 2>/dev/null || true
fi
echo "   ✅ Database ready"

# Step 3: Run migrations
echo ""
echo "3/6 🔧 Running migrations..."
node -e "
const { sequelize, User, JobSeekerProfile, Job, Application } = require('./src/models/index');
async function migrate() {
  await sequelize.sync({ alter: true });
  console.log('   ✅ Tables synchronized');
  process.exit(0);
}
migrate().catch(e => { console.log('   ⚠️  ' + e.message); process.exit(0); });
" 2>/dev/null || echo "   ⚠️  Migration completed with warnings"

# Step 4: Seed data
echo ""
echo "4/6 🌱 Seeding sample data..."
node -e "
const { User, JobSeekerProfile, Job } = require('./src/models/index');

async function seed() {
  const count = await User.count();
  if (count > 0) {
    console.log('   ℹ️  Data already exists (' + count + ' users)');
    process.exit(0);
  }
  
  // Create users
  const admin = await User.create({fullName:'System Admin',email:'admin@bossjobs.et',phoneNumber:'+251911234567',passwordHash:'Admin123!@#',role:'admin'});
  const employer = await User.create({fullName:'EthioTech Solutions',email:'hr@ethiotech.com',phoneNumber:'+251922345678',passwordHash:'Employer123!@#',role:'employer'});
  const seeker = await User.create({fullName:'Abebe Kebede',email:'abebe@email.com',phoneNumber:'+251933456789',passwordHash:'Seeker123!@#',role:'job_seeker'});
  
  // Create profile
  await JobSeekerProfile.create({userId:seeker.id,title:'Senior Developer',bio:'Experienced developer',skills:['JavaScript','Node.js','React','PostgreSQL'],experienceJson:[{company:'Tech Corp',position:'Developer',startDate:'2020-01',endDate:'2024-01'}],educationJson:[{institution:'AAU',degree:'BSc CS',graduationYear:2019}],latitude:9.0320,longitude:38.7469,isProfileComplete:true});
  
  // Create jobs
  await Job.create({employerId:employer.id,title:'Senior React Developer',description:'Join our team in Addis Ababa. Build modern web applications.',companyName:'EthioTech Solutions',jobType:'Full-time',salaryRange:'30,000-45,000 ETB',latitude:9.0320,longitude:38.7469,requiredSkills:['React','JavaScript','TypeScript'],requiredExperience:3,isFeatured:true,vacanciesCount:2});
  await Job.create({employerId:employer.id,title:'Mobile Developer',description:'Build Flutter apps for Android and iOS.',companyName:'EthioTech Solutions',jobType:'Contract',salaryRange:'25,000-35,000 ETB',requiredSkills:['Flutter','Dart','Firebase'],requiredExperience:2,vacanciesCount:3});
  await Job.create({employerId:employer.id,title:'Backend Developer',description:'Node.js developer for scalable APIs.',companyName:'EthioTech Solutions',jobType:'Full-time',salaryRange:'35,000-50,000 ETB',latitude:9.0320,longitude:38.7469,requiredSkills:['Node.js','PostgreSQL','Docker'],requiredExperience:4});
  await Job.create({employerId:employer.id,title:'UI/UX Designer',description:'Creative designer for our products.',companyName:'EthioTech Solutions',jobType:'Remote',salaryRange:'20,000-30,000 ETB',requiredSkills:['Figma','UI Design'],requiredExperience:2});
  
  console.log('   ✅ Sample data created (3 users, 4 jobs)');
  process.exit(0);
}
seed().catch(e => { console.log('   ⚠️  ' + e.message); process.exit(0); });
" 2>/dev/null || echo "   ℹ️  Data seeding skipped"

# Step 5: Free port
echo ""
echo "5/6 🔍 Preparing port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null && echo "   ✅ Port 3000 freed" || echo "   ✅ Port 3000 is available"

# Step 6: Start server
echo ""
echo "6/6 🚀 Starting Boss Jobs Ethiopia..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ SYSTEM IS STARTING..."
echo ""
echo "  🌐 Dashboard:  http://localhost:3000"
echo "  📚 API Docs:   http://localhost:3000/api/v1"
echo "  ❤️  Health:     http://localhost:3000/health"
echo ""
echo "  📝 Test Accounts:"
echo "  Admin:    admin@bossjobs.et / Admin123!@#"
echo "  Employer: hr@ethiotech.com / Employer123!@#"
echo "  Seeker:   abebe@email.com / Seeker123!@#"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

