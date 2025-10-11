# Sample Data Population Script

This directory contains scripts for populating the database with sample data for testing purposes.

## Prerequisites

1. Make sure MongoDB is running
2. Update your `.env` file with the correct `MONGODB_URI`
3. Have a valid student record in your `students` collection

## How to Use

### Step 1: Find Your Student ID

First, you need to find a valid `student._id` from your database. You can do this by:

1. Connecting to your MongoDB database
2. Running this query:
   ```javascript
   db.students.findOne()
   ```
3. Copy the `_id` field value

### Step 2: Update the Script

Open `populateSampleData.ts` and update the `STUDENT_ID` constant with your student's `_id`:

```typescript
const STUDENT_ID = new mongoose.Types.ObjectId('YOUR_STUDENT_ID_HERE');
```

### Step 3: Run the Script

From the `madrassati-back` directory, run:

```bash
npx tsx src/scripts/populateSampleData.ts
```

Or if you prefer to compile first:

```bash
npm run build
node dist/scripts/populateSampleData.js
```

## What Gets Populated

The script will populate the following collections with sample data:

- **Class Schedules** - Weekly class schedule across Monday-Friday
- **Grades** - Subject grades with homework, test, exam, and final grade breakdown
- **Tests** - Quizzes, tests, and midterms
- **Exams** - Final exams and comprehensive exams
- **Homework** - Active, completed, and upcoming homework assignments
- **Announcements** - School-wide announcements

## Important Notes

⚠️ **WARNING**: This script will **delete all existing data** for the specified student before populating new data. Make sure you're using a test student ID!

## Sample Data Structure

### Tests Collection
- Types: "test", "quiz", "midterm"
- Fields: studentId, title, subject, type, date, startTime, endTime, room, durationMinutes

### Exams Collection
- Types: "final", "exam"
- Fields: studentId, title, subject, type, date, startTime, endTime, room, durationMinutes

### Class Schedules Collection
- Fields: studentId, day, startTime, endTime, subject, room, status
- Grouped by day of the week in the API response

### Grades Collection
- Fields: studentId, subject, homework, test, exam, finalGrade, status
- All numeric grades (homework/20, test/20, exam/20, finalGrade/20)

## Troubleshooting

### Connection Error
If you get a connection error, make sure:
- MongoDB is running
- Your MONGODB_URI is correct in the .env file
- You have network access to the database

### Student Not Found
If the script completes but you can't see data:
- Verify the student ID exists in the database
- Check that you're querying with the correct userId (not studentId)
- Use the `/api/student/:userId/...` endpoints

## API Endpoints

After populating data, you can test these endpoints:

- `GET /api/student/:userId/profile` - Student profile
- `GET /api/student/:userId/dashboard` - Dashboard with counts
- `GET /api/student/:userId/schedule` - Class schedule (grouped by day)
- `GET /api/student/:userId/grades` - All grades with breakdown
- `GET /api/student/:userId/exams` - Exams and tests (separated)
- `GET /api/student/:userId/homework` - All homework assignments
- `GET /api/student/:userId/announcements` - All announcements

Remember: `:userId` is the `_id` from the `users` collection, not the `students` collection!

