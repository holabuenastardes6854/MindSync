'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface SessionFeedbackProps {
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export default function SessionFeedback({ onSubmit, onSkip }: SessionFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
  };
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };
  
  const starVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.2, rotate: 5 }
  };
  
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div 
        className="flex items-center mb-6"
        variants={itemVariants}
      >
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
          <Icon icon="mdi:brain" className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">How was your session?</h2>
      </motion.div>
      
      <motion.div 
        className="mb-8 text-gray-300"
        variants={itemVariants}
      >
        <p>Your feedback helps us improve your brain enhancement experience.</p>
      </motion.div>
      
      <form onSubmit={handleSubmit}>
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <motion.p 
            className="text-white mb-3 font-medium"
            variants={itemVariants}
          >
            Rate your experience:
          </motion.p>
          
          <div className="flex space-x-2 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="focus:outline-none"
                variants={starVariants}
                whileHover="hover"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: rating === star ? [0, -15, 15, -5, 5, 0] : 0,
                    scale: rating === star ? [1, 1.2, 1] : 1
                  }}
                  transition={{ 
                    duration: rating === star ? 0.5 : 0.2,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                  }}
                >
                  <Icon 
                    icon={
                      (hoveredStar || rating) >= star 
                        ? "solar:star-bold" 
                        : "solar:star-outline"
                    }
                    className={`w-10 h-10 ${
                      (hoveredStar || rating) >= star 
                        ? 'text-yellow-400' 
                        : 'text-gray-500'
                    } transition-colors duration-200`}
                  />
                </motion.div>
              </motion.button>
            ))}
          </div>
          
          <motion.p 
            className="text-center text-sm text-gray-400 h-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={hoveredStar || rating}
          >
            {hoveredStar === 1 || rating === 1 ? 'Poor' : ''}
            {hoveredStar === 2 || rating === 2 ? 'Fair' : ''}
            {hoveredStar === 3 || rating === 3 ? 'Good' : ''}
            {hoveredStar === 4 || rating === 4 ? 'Very Good' : ''}
            {hoveredStar === 5 || rating === 5 ? 'Excellent!' : ''}
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <label className="block text-white mb-3 font-medium">
            Share your thoughts (optional):
          </label>
          <motion.div
            initial={{ boxShadow: "0 0 0 rgba(167, 139, 250, 0)" }}
            whileFocus={{ boxShadow: "0 0 0 2px rgba(167, 139, 250, 0.3)" }}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-32 bg-gray-800/60 text-white rounded-lg p-4 border border-gray-700/50 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:outline-none transition-all duration-200"
              placeholder="Tell us about your experience..."
            />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.button
            type="submit"
            disabled={rating === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center
              ${rating === 0 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-purple-500/20'
              }`}
            whileHover={rating > 0 ? { scale: 1.02 } : {}}
            whileTap={rating > 0 ? { scale: 0.98 } : {}}
          >
            <Icon icon="mdi:send" className="mr-2 w-5 h-5" />
            Submit Feedback
          </motion.button>
          
          <motion.button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 font-medium hover:bg-gray-800/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for Now
          </motion.button>
        </motion.div>
      </form>
      
      <motion.div 
        className="mt-8 flex items-center justify-center text-sm text-gray-500"
        variants={itemVariants}
      >
        <Icon icon="mdi:lock" className="w-4 h-4 mr-1" />
        Your feedback is anonymous and helps us improve our service
      </motion.div>
    </motion.div>
  );
} 