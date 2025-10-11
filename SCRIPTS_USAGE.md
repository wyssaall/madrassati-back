# Scripts Usage Guide

## Overview

This directory contains helper scripts for managing student data in the database.

## Available Scripts

### 1. Find Students (`findStudents.ts`)

**Purpose:** Lists all students in the database with their data counts.

**Usage:**
```bash
cd madrassati-back
npx tsx src/scripts/findStudents.ts
```

**What it shows:**
- Full name
- Email
- Grade level
- Student ID (for data population)
- Linked User ID (for API calls)
- Count of grades, homework, exams, tests, and schedules

**Example Output:**
```
✅ Connected to MongoDB
📂 Database: madrassati
🌍 Host: localhost

📚 Found 2 student(s):

════════════════════════════════════════════════════════════════════

👤 Full Name: John Doe
   📧 Email: john@example.com
   🎓 Grade Level: Grade 10
   🆔 Student ID (for data script): 68d440c75a3bf315fb0ddc7b
   🔑 Linked User ID (for API calls): 68d440c75a3bf315fb0ddc7a

   📊 Data Summary:
      - Class Schedules: 0
      - Grades: 0
      - Homework Assignments: 0
      - Exams: 0
      - Tests: 0
      - Total Items: 0

   ⚠️  This student has NO data yet!
   💡 To populate sample data for this student:
      1. Edit src/scripts/populateSampleData.ts
      2. Change STUDENT_ID to: new mongoose.Types.ObjectId('68d440c75a3bf315fb0ddc7b')
      3. Run: npx tsx src/scripts/populateSampleData.ts
```

---

### 2. Populate Sample Data (`populateSampleData.ts`)

**Purpose:** Populates comprehensive sample data for a specific student.

**Usage:**

1. **First, find your student ID:**
   ```bash
   npx tsx src/scripts/findStudents.ts
   ```

2. **Edit the script:**
   Open `src/scripts/populateSampleData.ts` and update line 26:
   ```typescript
   const STUDENT_ID = new mongoose.Types.ObjectId('YOUR_STUDENT_ID_HERE');
   ```

3. **Run the script:**
   ```bash
   npx tsx src/scripts/populateSampleData.ts
   ```

**What it populates:**
- ✅ **14 Class Schedule entries** (Monday-Friday schedule)
- ✅ **8 Grade records** (with homework, test, exam breakdown)
- ✅ **5 Tests** (quizzes, tests, midterms)
- ✅ **4 Exams** (finals and comprehensive exams)
- ✅ **6 Homework assignments** (active, overdue, upcoming)
- ✅ **3 Announcements** (school-wide)

**Expected Output:**
```
✅ Connected to MongoDB
📂 Database: madrassati

🗑️  Clearing existing data...
✅ Existing data cleared

📅 Populating class schedules...
✅ Created 14 schedule entries

📊 Populating grades...
✅ Created 8 grade entries

📝 Populating tests...
✅ Created 5 test entries

📋 Populating exams...
✅ Created 4 exam entries

📚 Populating homework...
✅ Created 6 homework entries

📢 Populating announcements...
✅ Created 3 announcements

✅✅✅ All sample data populated successfully! ✅✅✅

📊 Summary:
   - Student ID: 68d440c75a3bf315fb0ddc7b
   - Schedules: 14
   - Grades: 8
   - Tests: 5
   - Exams: 4
   - Homework: 6
   - Announcements: 3

🔌 Disconnected from MongoDB
```

---

## Important Notes

### ⚠️ Student ID vs User ID

- **Student ID**: Used in the population script (`populateSampleData.ts`)
  - Found in the `students` collection
  - Example: `68d440c75a3bf315fb0ddc7b`

- **User ID**: Used in API endpoints
  - Found in the `users` collection
  - Linked to student via `userId` field
  - Example: `68d440c75a3bf315fb0ddc7a`

### ⚠️ Data Clearing

The `populateSampleData.ts` script will **DELETE all existing data** for the specified student before populating new data. This includes:
- Class schedules
- Grades
- Homework
- Exams
- Tests

**Announcements are NOT deleted** as they are school-wide, not student-specific.

### ⚠️ Dynamic Dates

The homework assignments use **dynamic dates** based on when you run the script:
- Some will be active (started, not yet due)
- Some will be overdue (past due date)
- Some will be upcoming (not yet started)

This ensures realistic testing data regardless of when you run the script.

---

## Troubleshooting

### Error: "Cannot find module"

**Problem:**
```
Error: Cannot find module 'src/models/Student.model.js'
```

**Solution:** The scripts use `.js` extensions for ES modules. This is correct! Use `tsx` instead of `ts-node`:
```bash
npx tsx src/scripts/findStudents.ts
```

### Error: "No students found"

**Problem:**
```
❌ No students found in the database!
```

**Solution:** You need to create a student account first:
1. Use the registration endpoint
2. Or manually create one in MongoDB

### Error: "Connection refused"

**Problem:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running:
```bash
# Start MongoDB service
mongod
```

### Error: "Student not found in collection"

**Problem:** The population script says student ID doesn't exist.

**Solution:**
1. Run `findStudents.ts` to get valid student IDs
2. Make sure you're using **Student ID**, not User ID
3. Copy the ID exactly as shown

---

## Environment Variables

Both scripts use the `MONGODB_URI` environment variable from `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/madrassati
```

If not set, they default to `mongodb://localhost:27017/madrassati`.

---

## Running Scripts

### From Project Root:
```bash
cd madrassati-back
npx tsx src/scripts/findStudents.ts
npx tsx src/scripts/populateSampleData.ts
```

### From madrassati-back Directory:
```bash
npx tsx src/scripts/findStudents.ts
npx tsx src/scripts/populateSampleData.ts
```

---

## After Populating Data

### Test API Endpoints

Use the **User ID** (not Student ID) in API calls:

```
GET http://localhost:5000/api/student/{userId}/profile
GET http://localhost:5000/api/student/{userId}/grades
GET http://localhost:5000/api/student/{userId}/homework
GET http://localhost:5000/api/student/{userId}/exams
GET http://localhost:5000/api/student/{userId}/schedule
GET http://localhost:5000/api/student/{userId}/announcements
```

### Login to Frontend

1. Start backend: `npm run dev`
2. Start frontend: `cd ../madrassati-front && npm run dev`
3. Login with student's email and password
4. Check all pages for data

---

## Quick Reference

| Task | Command |
|------|---------|
| Find students | `npx tsx src/scripts/findStudents.ts` |
| Populate data | `npx tsx src/scripts/populateSampleData.ts` |
| Check MongoDB | `mongosh` then `use madrassati` then `db.students.find()` |
| Build backend | `npm run build` |
| Run backend | `npm run dev` |

---

## Need Help?

See the main documentation:
- `QUICK_START.md` - Quick fix guide
- `TESTING_GUIDE.md` - Detailed testing instructions
- `DATA_FETCHING_FIX_COMPLETE.md` - Complete API reference

