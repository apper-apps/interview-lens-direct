import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const QuestionCard = ({ question, questionNumber, totalQuestions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {questionNumber}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <ApperIcon name="MessageCircle" size={18} className="text-primary-600" />
              <span className="text-sm font-medium text-neutral-600">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-neutral-900 leading-relaxed">
{question.text}
            </h2>
            
            {question.maxDuration && (
<div className="flex items-center gap-1 mt-4 text-sm text-neutral-500">
                <ApperIcon name="Clock" size={14} />
                <span>Maximum duration: {Math.floor(question.maxDuration / 60)}:{(question.maxDuration % 60).toString().padStart(2, "0")}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;