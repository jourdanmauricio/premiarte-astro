import { Star, StarHalf } from 'lucide-react';

interface StarsRatingProps {
  rating: number;
}

export const StarsRating = ({ rating }: StarsRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className='h-5 w-5 fill-yellow-500 text-yellow-500'
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          key='half'
          className='h-5 w-5 fill-yellow-500 text-yellow-500'
        />
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star key={`empty-${i}`} className='h-5 w-5 text-yellow-500' />
      ))}
    </div>
  );
};
