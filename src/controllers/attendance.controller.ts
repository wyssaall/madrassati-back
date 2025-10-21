import { Request, Response, NextFunction } from 'express';
import Attendance from '../models/Attendance.model.js';
import Student from '../models/Student.model.js';

/**
 * Get students by class for attendance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getStudentsByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { className } = req.params;
    
    console.log('📊 Fetching students for class:', className);

    // Find all students in the class
    const students = await Student.find({ className })
      .select('_id name email className attendance')
      .lean();

    console.log(`📚 Found ${students.length} students in class ${className}`);

    // Calculate overall attendance for each student (TTL automatically limits to 7 days)
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        const [presentCount, totalCount] = await Promise.all([
          Attendance.countDocuments({ 
            studentId: student._id, 
            status: 'Present'
          }),
          Attendance.countDocuments({ 
            studentId: student._id
          })
        ]);
        
        const overallAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
        
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          className: student.className,
          overallAttendance
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        className,
        students: studentsWithAttendance
      },
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching students by class:', error);
    next(error);
  }
};

/**
 * Mark attendance for a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, teacherId, className, subject, status } = req.body;

    if (!studentId || !teacherId || !className || !subject || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('🔄 Marking attendance:', { studentId, teacherId, className, subject, status });

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if an existing record is locked (>24h old)
    const existing = await Attendance.findOne({ studentId, subject, date: todayDate });
    if (existing) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (existing.createdAt < oneDayAgo) {
        return res.status(403).json({ success: false, message: 'Attendance locked after 24h' });
      }
    }

    // Upsert record for today
    const updated = await Attendance.findOneAndUpdate(
      { studentId, subject, date: todayDate },
      {
        $set: {
          teacherId,
          className,
          subject,
          status,
          time: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          updatedAt: now
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, new: true }
    );

    // TTL index automatically handles cleanup after 7 days

    // Recalculate student's overallAttendance (TTL automatically limits to 7 days)
    const [presentCount, totalCount] = await Promise.all([
      Attendance.countDocuments({ 
        studentId, 
        status: 'Present'
      }),
      Attendance.countDocuments({ 
        studentId
      })
    ]);
    
    const overallAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    await Student.findByIdAndUpdate(studentId, { $set: { attendance: overallAttendance } });

    console.log('✅ Attendance marked successfully');

    return res.status(200).json({ 
      success: true, 
      data: { 
        ...updated.toObject(),
        overallAttendance 
      }, 
      message: 'Attendance marked successfully' 
    });
  } catch (error) {
    console.error('❌ Error marking attendance:', error);
    next(error);
  }
};


