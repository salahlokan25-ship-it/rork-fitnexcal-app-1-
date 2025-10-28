import { useQuery } from '@tanstack/react-query';
import { getFoodSuggestions } from '@/services/food-api';

export const useFoodSuggestions = () => {
  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['food-suggestions'],
    queryFn: getFoodSuggestions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refreshSuggestions = async () => {
    await refetch();
  };

  return {
    suggestions,
    isLoading,
    refreshSuggestions,
  };
};