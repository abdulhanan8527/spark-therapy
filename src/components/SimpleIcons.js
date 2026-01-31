import React from 'react';
import { View, Text } from 'react-native';

// Simple icon component to avoid @expo/vector-icons issues
const SimpleIcon = ({ name, size = 24, color = '#000' }) => {
  // Map common icon names to simple Unicode characters
  const iconMap = {
    'home': '🏠',
    'message-circle': '💬',
    'play-circle': '▶️',
    'file-text': '📄',
    'calendar': '📅',
    'bell': '🔔',
    'dollar-sign': '💵',
    'user': '👤',
    'user-plus': '👤+',
    'user-plus-alt': '👥',
    'book': '📚',
    'check': '✓',
    'alert-circle': '⚠️',
    'clock': '⏰',
    'search': '🔍',
    'upload': '📤',
    'video': '🎥',
    'message-square': '💬',
    'credit-card': '💳',
    'chevron-right': '▶️',
    'log-out': '🚪',
    'users': '👥',
    'clipboard': '📋',
    'camera': '📷',
    'x-circle': '❌',
    'x': '✕',
    'send': '📤',
    'printer': '🖨️',
    'alert-triangle': '⚠️',
    'triangle-alert': '⚠️',
    'download': '📥',
    'eye': '👁️',
    'document-text': '📝',
    'trending-up': '📈',
    'trending-down': '📉',
    'trophy': '🏆',
    'smile': '😊',
    'frown': '😞',
    'meh': '😐',
    'thumbs-up': '👍',
    'thumbs-down': '👎',
    'target': '🎯',
    'baby': '👶',
    'graduation-cap': '🎓',
    'trash-2': '🗑️',
    'edit': '✏️',
    'plus': '➕',
    'mail': '✉️',
    'lock': '🔒',
    'arrow-left': '⬅️',
    'chevron-left': '◀️',
    'chevron-right': '▶️',
    'chevron-up': '🔼',
    'chevron-down': '🔽',
    'paperclip': '📎',
    'image': '🖼️',
    'filter': '🔍',
    'star': '⭐',
    'video-icon': '📹',
    'book-open': '📖',
    'phone': '📞',
    'play': '▶️',
    'check-circle': '✅'
  };

  const iconChar = iconMap[name] || '●'; // Default to bullet point
  
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ 
        fontSize: size * 0.8, 
        color: color,
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center'
      }}>
        {iconChar}
      </Text>
    </View>
  );
};

// Export individual icon components
export const Home = (props) => <SimpleIcon name="home" {...props} />;
export const MessageCircle = (props) => <SimpleIcon name="message-circle" {...props} />;
export const Play = (props) => <SimpleIcon name="play-circle" {...props} />;
export const FileText = (props) => <SimpleIcon name="file-text" {...props} />;
export const Calendar = (props) => <SimpleIcon name="calendar" {...props} />;
export const Bell = (props) => <SimpleIcon name="bell" {...props} />;
export const DollarSign = (props) => <SimpleIcon name="dollar-sign" {...props} />;
export const User = (props) => <SimpleIcon name="user" {...props} />;
export const UserPlus = (props) => <SimpleIcon name="user-plus" {...props} />;
export const Book = (props) => <SimpleIcon name="book" {...props} />;
export const CheckCircle = (props) => <SimpleIcon name="check" {...props} />;
export const AlertCircle = (props) => <SimpleIcon name="alert-circle" {...props} />;
export const Clock = (props) => <SimpleIcon name="clock" {...props} />;
export const Search = (props) => <SimpleIcon name="search" {...props} />;
export const Upload = (props) => <SimpleIcon name="upload" {...props} />;
export const Video = (props) => <SimpleIcon name="video" {...props} />;
export const MessageSquare = (props) => <SimpleIcon name="message-square" {...props} />;
export const CreditCard = (props) => <SimpleIcon name="credit-card" {...props} />;
export const ChevronRight = (props) => <SimpleIcon name="chevron-right" {...props} />;
export const LogOut = (props) => <SimpleIcon name="log-out" {...props} />;
export const Users = (props) => <SimpleIcon name="users" {...props} />;
export const Clipboard = (props) => <SimpleIcon name="clipboard" {...props} />;
export const Camera = (props) => <SimpleIcon name="camera" {...props} />;
export const XCircle = (props) => <SimpleIcon name="x-circle" {...props} />;
export const X = (props) => <SimpleIcon name="x" {...props} />;
export const Send = (props) => <SimpleIcon name="send" {...props} />;
export const Printer = (props) => <SimpleIcon name="printer" {...props} />;
export const AlertTriangle = (props) => <SimpleIcon name="alert-triangle" {...props} />;
export const TriangleAlert = (props) => <SimpleIcon name="triangle-alert" {...props} />;
export const Download = (props) => <SimpleIcon name="download" {...props} />;
export const Eye = (props) => <SimpleIcon name="eye" {...props} />;
export const DocumentText = (props) => <SimpleIcon name="document-text" {...props} />;
export const TrendingUp = (props) => <SimpleIcon name="trending-up" {...props} />;
export const Trophy = (props) => <SimpleIcon name="trophy" {...props} />;
export const Smile = (props) => <SimpleIcon name="smile" {...props} />;
export const Frown = (props) => <SimpleIcon name="frown" {...props} />;
export const Meh = (props) => <SimpleIcon name="meh" {...props} />;
export const ThumbsUp = (props) => <SimpleIcon name="thumbs-up" {...props} />;
export const ThumbsDown = (props) => <SimpleIcon name="thumbs-down" {...props} />;
export const Target = (props) => <SimpleIcon name="target" {...props} />;
export const Baby = (props) => <SimpleIcon name="baby" {...props} />;
export const GraduationCap = (props) => <SimpleIcon name="graduation-cap" {...props} />;
export const TrendingDown = (props) => <SimpleIcon name="trending-down" {...props} />;
export const Trash2 = (props) => <SimpleIcon name="trash-2" {...props} />;
export const Edit = (props) => <SimpleIcon name="edit" {...props} />;
export const Plus = (props) => <SimpleIcon name="plus" {...props} />;
export const Mail = (props) => <SimpleIcon name="mail" {...props} />;
export const Lock = (props) => <SimpleIcon name="lock" {...props} />;
export const ArrowLeft = (props) => <SimpleIcon name="arrow-left" {...props} />;
export const ChevronLeft = (props) => <SimpleIcon name="chevron-left" {...props} />;
// Note: ChevronRight already exists above
export const ChevronUp = (props) => <SimpleIcon name="chevron-up" {...props} />;
export const ChevronDown = (props) => <SimpleIcon name="chevron-down" {...props} />;
export const Paperclip = (props) => <SimpleIcon name="paperclip" {...props} />;
export const Image = (props) => <SimpleIcon name="image" {...props} />;
export const Filter = (props) => <SimpleIcon name="filter" {...props} />;
export const Star = (props) => <SimpleIcon name="star" {...props} />;
export const VideoIcon = (props) => <SimpleIcon name="video-icon" {...props} />;
export const BookOpen = (props) => <SimpleIcon name="book-open" {...props} />;
export const Phone = (props) => <SimpleIcon name="phone" {...props} />;
export const PlayIcon = (props) => <SimpleIcon name="play" {...props} />;
export const CheckCircleIcon = (props) => <SimpleIcon name="check-circle" {...props} />;

export default SimpleIcon;