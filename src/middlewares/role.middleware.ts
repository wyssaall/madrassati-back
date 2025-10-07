/**
 * Role-based access control middleware
 */

/**
 * Middleware to check if user has required role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required.'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Role verification failed.'
      });
    }
  };
};

/**
 * Middleware to check if teacher is assigned to a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireTeacherForClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    // Check if user is authenticated and is a teacher
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Teacher role required.'
      });
    }

    // TODO: Validate ObjectId format
    // if (!mongoose.Types.ObjectId.isValid(classId)) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Invalid class ID format.'
    //   });
    // }

    // TODO: Check if teacher is assigned to this class
    // const classData = await Class.findById(classId);
    // if (!classData) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Class not found.'
    //   });
    // }
    
    // if (classData.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. You are not assigned to this class.'
    //   });
    // }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Class permission verification failed.'
    });
  }
};

