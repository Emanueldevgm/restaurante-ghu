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
    const [notaComida, setNotaComida] = useState(0);
    const [notaEntrega, setNotaEntrega] = useState(0);
    const [notaAtendimento, setNotaAtendimento] = useState(0);
    const [notaPreco, setNotaPreco] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createReviewMutation = useCreateReview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (notaComida === 0 || notaEntrega === 0 || notaAtendimento === 0 || notaPreco === 0) {
            alert('Por favor, avalie todos os aspectos (comida, entrega, atendimento e preço)');
            return;
        }

        if (comment.trim().length === 0) {
            alert('Por favor, escreva um comentário');
            return;
        }

        setIsSubmitting(true);
        try {
            await createReviewMutation.mutateAsync({
                pedido_id: orderId,
                nota_comida: notaComida,
                nota_entrega: notaEntrega,
                nota_atendimento: notaAtendimento,
                nota_preco: notaPreco,
                comentario: comment.trim(),
            });

            // Reset form
            setNotaComida(0);
            setNotaEntrega(0);
            setNotaAtendimento(0);
            setNotaPreco(0);
            setComment('');
            onSuccess?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStarRating = (value: number, setValue: (value: number) => void, label: string) => (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setValue(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            size={24}
                            className={`transition-colors ${
                                star <= (hoverRating || value)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
            {value > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                    {value}/5 estrelas
                </p>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            <div>
                <h3 className="font-semibold text-lg mb-4">Como foi sua experiência?</h3>

                {/* Food Rating */}
                {renderStarRating(notaComida, setNotaComida, 'Qualidade da comida')}

                {/* Delivery Rating */}
                {renderStarRating(notaEntrega, setNotaEntrega, 'Qualidade da entrega')}

                {/* Service Rating */}
                {renderStarRating(notaAtendimento, setNotaAtendimento, 'Qualidade do atendimento')}

                {/* Price Rating */}
                {renderStarRating(notaPreco, setNotaPreco, 'Relação preço/qualidade')}
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
                disabled={isSubmitting || notaComida === 0 || notaEntrega === 0 || notaAtendimento === 0 || notaPreco === 0 || comment.trim().length < 10}
                className="w-full"
            >
                {isSubmitting ? 'Enviando avaliação...' : 'Enviar Avaliação'}
            </Button>
        </form>
    );
}
