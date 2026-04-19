import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/useApi';

interface ReviewFormProps {
    orderId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ orderId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createReviewMutation = useCreateReview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Selecione uma classificação (1-5 estrelas)');
            return;
        }

        if (comment.trim().length === 0) {
            alert('Por favor, escreva um comentário');
            return;
        }

        setIsSubmitting(true);
        try {
            await createReviewMutation.mutateAsync({
                order_id: orderId,
                rating,
                comment: comment.trim(),
            });

            // Reset form
            setRating(0);
            setComment('');
            onSuccess?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            <div>
                <h3 className="font-semibold text-lg mb-4">Como foi sua experiência?</h3>

                {/* Star Rating */}
                <div className="flex gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={`transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                        Classificação: <span className="font-semibold">{rating}/5 estrelas</span>
                    </p>
                )}
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                    Seu comentário
                </label>
                <Textarea
                    id="comment"
                    placeholder="Compartilhe sua experiência... (mínimo 10 caracteres)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    minLength={10}
                    maxLength={500}
                    className="min-h-[120px]"
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                className="w-full"
            >
                {isSubmitting ? 'Enviando avaliação...' : 'Enviar Avaliação'}
            </Button>
        </form>
    );
}
