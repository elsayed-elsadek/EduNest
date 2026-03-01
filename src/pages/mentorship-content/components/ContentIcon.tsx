import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faQuestionCircle,
  faFileAlt,
  faCalendarAlt,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import type { ContentType } from '../types';

const className = 'w-5 h-5 text-gray-500 shrink-0';

const ContentIcon: FC<{ type: ContentType }> = ({ type }) => {
  let icon = faFileAlt; // default
  switch (type) {
    case 'lecture':
      icon = faVideo;
      break;
    case 'quiz':
      icon = faQuestionCircle;
      break;
    case 'assignment':
      icon = faFileAlt;
      break;
    case 'session':
      icon = faCalendarAlt;
      break;
    case 'project':
      icon = faFolderOpen;
      break;
  }
  return <FontAwesomeIcon icon={icon} className={className} />;
};

export default ContentIcon;
