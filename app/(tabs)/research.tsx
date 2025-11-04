import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Search, ChevronRight, Filter, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { searchFoods, getFoodsByCountry, searchFoodsByCategory, searchNutritionXFoods } from '@/services/food-api';
import { COUNTRIES_FOODS } from '@/constants/nutrition';
import FoodCard from '@/components/FoodCard';
import { useTheme } from '@/hooks/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ResearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{
    maxCalories?: number;
    minProtein?: number;
    category?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['food-search', searchQuery, searchFilters],
    queryFn: () => {
      if (Object.keys(searchFilters).length > 0) {
        return searchNutritionXFoods(searchQuery, searchFilters);
      }
      return searchFoods(searchQuery);
    },
    enabled: searchQuery.length > 2,
  });

  const { data: categoryResults = [], isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category-search', searchFilters.category],
    queryFn: () => searchFoodsByCategory(searchFilters.category!),
    enabled: !!searchFilters.category && !searchQuery,
  });

  const { data: countryFoods = [], isLoading: isLoadingCountry } = useQuery({
    queryKey: ['country-foods', selectedCountry],
    queryFn: () => getFoodsByCountry(selectedCountry!),
    enabled: !!selectedCountry,
  });

  const handleFoodPress = () => {
    console.log('Food pressed');
  };

  const dynamic = stylesWithTheme(theme);

  const getFlagImageUrl = (countryCode: string) => {
    const flagMap: Record<string, string> = {
      'it': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbMCDtmec9ljG0rKtwjVejtx0xGEGJV-Zao66rc0or-hR3gNJflJOwKSlf9AE5GeuIB0vsiR6yF6gviY_urLn7bfGzigZbfii5Qm8MY80KxS4z2bc-xq8YNncjiIh1Tv2NBuO1R-BZ6YleHVbkiLC3BWex9ZMYKkiSVT-XLQ1_0rn1wAQu4rAcQ68-JBw3EhWupzy9oRhBF5nEvuQoIG8CznFlg3soZKsQSaaua5XNY2T3LuaonA0H519_Vlhdwrnch79-uHcAobdH',
      'mx': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeF5hsoasMY_Ci4uOpUVKU8awA60jOxOFdxZXn2yRk8z92OsXKk3gQVUkf9GJrX_v-3140TOTKa-bP4l3KuIk9RV7cDG28BMEoQyFTTMAjdutmdRB6XZDokhgPWfZ_QvTFkSXwqDcr3j8mqVN4rcRsgYh9YtxtYFLM7Wb3Uzh5SNTvteyE52pY9TbKQyaP9qGKSnKCgOtmvPvxFR0BcmyW2wmJ1g2JggK2M_rqqUL8x22ZY1QLzv-No0HCAFIuQzvXlO7lNsfuLKnG',
      'fr': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TWLo8SO0T8BRt2uxc7IktqDWE9mYP1sYiPRrzOndVy3btIguQWeYF4lofIL3lhCr2ap3rt5b8n-ZuZj_qCbG8P_z8NLdLqaPyQl0EwDvfsXzWLq6VdOPXX7X1Wjcs609tnchIjFox9JZYmLGwNA88lTZIGWweNm4336bAhSbo_BDUp9-ACv1O8o-iE4D1LUbLOdtwAH51-OhYxj1jus7TvAuXUBH-FE4q_DcrzAQrARI5eQ_lWXab8wMS1z-gVXDPCwlljRG1Ffm',
      'cn': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIZ-T6gldTqOA198ihF4I2xiucirgUAAOyZA3vZOFx_uDG-QZPrYGahiJ16rwKjWq-D1N-n1TtFH7zWhhQkbTPDgrUtd1bPSPLIOzmnVaiT18_GlPYezxET6lgekrqVePFZhU84vOaGzTyv_3Vzjj3eedkLqCsbQu5Z6sEV8ng6-2diOU6l3MutleCe2r6GZKgKEeMM0stkHsPwas_4AG5K0qTgjabwASeTHrL2ofDo6janDtl0yYSpkWGuX-FX3HKhKyEjSJsIucT',
      'ar': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFmbHyd52h6QcgRTlDeuQCoinvw3_J3vHwi1Q845yanLRXlBDQ7SyVN5OG2fMBt3KUSgEwcciP1rmdKiKe5aU032cGKGDnItaq3BfC8Eshvia5B4l4QYj9AXt33Ew19FxqLWOlYTX1ET3Y3PUdxBG2zXrDokdjw33GdMVC3ebhR42TwEZctaYx15pgd61nfz4A-V3fU0lOBhQ9pfJ8Oa8pahVd-UPUHw4N9jR_51B4kyFqaXcrRlBX0faE8Ts0kDv9bOi1gEYDh3Sx',
      'kr': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwp_mrJm0kc96QssmZt5TFfIJ53IK0a523PplStQOSq_xj0TlJcKXAnLRTv6BJfENbbh-tg_sAuMj6TnOnhdbMhUpq6HNe387jR3nFnTYfi490_eDbDxw2W0JnqAyz5IMMC30JE1JmSWb_FBZXERUNrqH5yyHyvSn9FRDtN6THsvmSiGFSKPJPud0B5e4hz0WlWDRUFzJtdcQXxrmDkQ1AQiRmTpRy41OKOExPkpfmkhGFqkUgUwwUpUvk8rmyQ-U90as8ZrKVfU4u',
      'be': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyhr5Y_Tn4RbxVDmz_MaDd49YsTZQ9jr8uaouXNJ9pfBKKgNsO7SMUX0yibHnsiqqG63C5nqe0yRU8gDbvEjDdBK8_rPuX7Gk98hiCn4CL4k1NTy2KohAw0MtW0XAuDV1TcHEQ99meOBjBoBZOGcWgLiqJFwZ6tj0qLYuY3AUYhFEO18hXzxAEqLWM1AElaoe_wabETnD2Lgzur1kDa8grVcUEvEDHkLU1WNbvjgnV2agSK_LmejQK7IgK3gpqYq14dgm7KcxPeCbI',
      'gr': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMEmXOjDgihIjyjRXZNRreD1XIpUhkNzAwTPrqVZvrQSG9Q5s8vPeZpQZzQqvwJ9jZWSM9YBtZheRjwiawptS1Whp8vSCwA7Efc3UXJMXvgGCYI0FN7y8TpOBkf14HFhlsC7iVtldGGCsZqZJf7V-YXon6pczyz20FJw2ZUhs5W1sTbzz1E8twYNcjjxHEtcKlEy1tdIUJ0ljI2IWWVM97jzlcytLJ063N7rydydffI46lqbo6DSEac5c-w16fHR7MISGlJMDj4kn7',
      'lb': 'https://lh3.googleusercontent.com/aida-public/AB6AXuApC2i2C2BLZwI63rYty8hatBw3loL8Yab_PbFudd0IPi9RAL-WiQ1huyiZtrSHctsUD448YwaHT7EqpXXyxfi_WyZRJLya9seibTMEGXKKSbMEH_lzwfAp281RT-0jinUj_iMgd5HHrC4q6BeejDEFTtuuBgiLpdEogjQGzW11Hv9gNqVnDKT1zQx2C7VqivBSIkOaZ7bkpSEKNUPpWgaGhl14xiTb2pfonBdBTJKqploFNkS50AIQ-eAMnGZFEISDE8t6lgil0jQd',
      'pt': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgwYXuJBAaxvmx6M6r9g1s9qC_h5AY3ALVcv7Lh5uaClD_tu5QhBUSMDifiINGLCZilg-W1vQS_hZApnKmKE7g7X5HSjSahfh8CwtrAcY_8MhSWpfGlt7Imd4KYwhr_pVFBy-CFfxEc2FE5N_871bOc_h4T8bWtIj1buL0YRkA_rPCtKeQETEZsdwQIgc1XX6NF7kENBx8jr0OUbgWfTVKvU0ZGRJ9DodSb5Af9bFz9sNjlImgqFH8-BCaKmiXyaSNir5wP9AmUsMY',
      'gb': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmuyD8ZzX_kAmMfCk7coAPzTfv4FzJHyLVsJ8ckD5FZQWt89i6sRq3JyRJ_4kAWdaDyaRSAnSjnunBNuePxRL8o4cN912r51rdMTfM1U6kmvQKXilMp7-j0fm4tjwZu7p9JFzrrArYBXLvnBVoAt6peON7MEu2Zw8MqnpeKh-MInSu4VViSTF5exHhBSYEzyWiNmEwBElAm8ubv-bHJ2tUiKFU4ThlAe8rA79jBqOHBUp_cPciV2GlnaDKR4YynfV68MNnNVrkZS-T',
      'sy': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1a87xcxhxFsDioJMPfZrsElCBKBYA82JshiXzy-9F_IV12_OuwqDu8ZQ68bo-Zdu2QBtwV1_M0WhyHMgXVVJyBKkrRuEqEzFIrKwktC5NRdw5WMXBxIW1yUCyJgN-QvFMux8Dm91fPKE5LGhPxxTGDvsz1Ptm9riiIIhd3trq02_ro4Y2VQP7f7wbmPv523k8x5k73f8l5LQC2Krl0VyC749hHfXAQIPYZUVagvEBn1lpDdp5qs1JBDLWgIia3dROU3_xTPLMnLS_',
      'et': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXmHyGpVtem6tiLh_VZD1yKmHFe9ZSaWWCfwzAkxABq4OlJI3PCVrsC3PIpp-1G8J-sfL9XI4shdVgxdE-m7R-QGBluOd8BFT033PA5L719_yR2NiMQGGsbZIIo7-P-X-Kp1MpzlKM947PXXCepPH574MB2-AmcJ5b1t2EWkC5rDnlNYBx2OFKfLE9VapxM1OsvwaqFq3xjyBKHJhDk8MrMnKAcHOt_Vp2DzRIE7nf8yW_51S-aUJzyjakPaAMSA6_DDik1_zviSZI',
      'id': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx96cL8oXi8SGL2XSFbwT0Qu2Zh5QOPQhxanuq_QDmeiuaEz7zUX8Y6Yb2tPz8LOERo6uxevWXwfs8CpTo1mnFwRVFFLpblg32Bijt-IPRHQlaGQXiXoddOYzbdWXVvLlKzyfw0tzaggrCl5fnw_yrzUb_zx7YTdhvD9GUeKYHNaFFWPLRiw40GzdTjkCqMQysjZijyjXGKnZpXuztmwV-Pg1QzeAs0cLaHHT7OYTBC2ey5G5fSVgUVObAw4JULWClGuEw7Gzrxxss',
      'ma': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzJgMYmKMnOdQWQB0JfnenX2LJuP7bzhBN5fa2dQNT9MrbeTHCRjpkgAwtWTNj50Oi1VvSg_KkywOdSKRMNGqTV9ruFfVbGePVpKDSiEyTy8oSxNF2I9C_7k5SiWX7JBwsGodnhm73xsDlvPcP5HRElUMH1cynLNt0eq2cHO9XqA2nZ1JzpAAHp1Li_W0Y82pAthjP9sVupIS9mNVQBZkgt-XA6wujDVhG12UauaTIM9WLYFFDVic-tHACCVO2kmF25wJajqphjEup',
      'us': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAihrltKrpGpwEsy36hVX09kmpMYqzrdaai2K5VVR_Q00uI72W6XdAtfyVJAHunyLOdBAucZvbcmUjZ0Dv6VO6WHXvEsozo0Tj2n7olhZHWH7FxdoAEUSVS5YL_Xglw7Aa38k_7d2yDlmH2fF_lSnys7hP_xFUZoxdeuDhfbDjiH1dZn-8dwCNwcABHfatDp1OR3d0qpsoEl_eW1u5DnyzXq1OTjQcBbVbHMQxTrPPP2vbF2Dhk6zS1cY0hRWjh8pyf_9lqnP0RKcZI',
      'vn': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCArjox17x-Go-br3DEtpX51eEPaKoqr9yOqVJL4604rS7lvegwbVOouP1xsg5Dd62z-O3KIzfIv-e4_4x_I1RY7-aMFE8mXx76t1MFn_Ux0j1wP_Ck_BixzeY_l9IKSguZTbSUAEDHL1_6Ky1b-7iab6or4-UbbfdjpU0hcMuHZIsrn4XToAakfJZwXRi1QD7ZyDZ6Y1xHXxXd5y1V6UemD_kP90pvuygUdzqaqpd1e3Q22IRbXdzmFDsYLtE0x9XyNbXZTj3rrzVC',
      'tr': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjDzpOMzeuhYlV-r4J-fnKldKWgBs6bbp5zlOfC6pl0eMe3jlRqL6dRJDdfK84upfQsdRZxb9qs7zRNWU2aD5j9lm3RGYFaFovzMKqp8qJs2EJ5vEL-jz12BKNQIsvRMyFfKO2pqHKFI61wIcVjR_oXg6KpM-yWmsphxNp-vbBKF9CJ7mhdxBPKOKNRqOFUy6TscpBG8LpSqs0_iyqTxz1NAHAakKYctn0JTbPvotf0H7FEjU-yyvHzWBUkcbeaFQXUO5ujeTOv4iE',
      'th': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGXoE3bLt0KbS44k2ooqLFPJMTNUpNZqwhLlj36Rnt2vIymbWO_PGqpZ-zj4-lzhAPqkqU61gkV4zO8KB3gxrUymWPUmDsG57hrDXtrobMgyeU2oCk3qcGQJGtNw4_KSJzLQl7u8yc4AMz6l7OV5n6-SIu3jN6lAGTGPiDW9Cq-_T-0jEpPxolajgBkqnSCrSJ5zNv6wrQqTSg6MIBdzyqETrlla4_L_a7JO2I0ClneRLmOsZlq7I4CM4dKF5_7zgd9iYYeEAi1JID',
      'in': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL3mUfqC-gWvtk8iwCeTDyNNZgJYLjPeYpSGJiktWyaMjaTlY0jp7qr82_NPZ_LP_3w9e6McGhhfgGyDTJHFO3cXhYNcEglHCKZSfHtbCJFx0GzHIMCJFOI31whCWLNe_Cm86btd_ADF-uWDvhAmayKXw88Tqwhu7F5V_TlMr0Zravv315oZXNauT0egw4p2FbYYbdyjnCqndBgBJt3-UhBzVFceaxdcIg0o2vqh1KAE7M8Dk36ZW5PX1PeM4QdOySMzGlL0KK_fj2',
      'es': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA30s45osOS5Qqw3QuVc7rC3tNnGkdlDH3JlXLN3AR2R7tCx2AX3Qu8yNafDwIRpjD1M7yYnfpwKVpj2clkhLvrh6BAXBJoQoENcbX4UTTbJFcTQxT7mc95H1uhRqsXdy-tM3je30NV4d4hZoda55H_ldFSWZPfZykHlT26ugfekxVB6Qji0DxPOpNAHJIrU8q8K2Nm1GzOb-TT_wB4tp0kxTuh-E6ZS8rmTvpRmFRiWnUTG03xana2zCfTgqQDLnR4IMQ8SZN0Nwz4',
      'jp': 'https://lh3.googleusercontent.com/aida-public/AB6AXuATafgkD_1P0u1LVhig0kMJeuC06XS-7JQJZe6AifQjzfKg7eRM3ghLShxfdQrZNoB4vk9aykDeP4zlDSZ-0WOKCayC8PbXzwrZkE3ouxfqtFitTx6qdoE4xVL73EA8kcoKDg95t8-b-lUPeBpC--dmNDvMdKh8bPzyE3wvwZF4Vt9nPn_5Iuhmbro-kzlG8-szJ3CEXTBhZPPHPRxxIzMNKVZvAzR1_QBXKxEOsmJ4L0gkc83kNQO_EYeZ9KlsbLUzfyQYsCa6j0k5',
    };
    return flagMap[countryCode] || '';
  };

  const renderCountryButton = ({ item }: { item: typeof COUNTRIES_FOODS[0] }) => (
    <TouchableOpacity
      testID={`country-${item.code}`}
      style={dynamic.countryButton}
      onPress={() => setSelectedCountry(item.code)}
    >
      <View style={dynamic.countryContent}>
        <Image
          source={{ uri: getFlagImageUrl(item.code) }}
          style={dynamic.countryFlag}
        />
        <Text style={dynamic.countryName}>
          {item.country}
        </Text>
      </View>
      <View style={dynamic.chevronContainer}>
        <ChevronRight size={20} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }: { item: any }) => (
    <FoodCard
      food={item}
      onPress={handleFoodPress}
      variant="grid"
      containerStyle={{ flex: 1 }}
    />
  );

  return (
    <View style={dynamic.container}>
      <View style={[dynamic.header, { paddingTop: insets.top + 8 }]}>
        <View style={dynamic.headerSpacer} />
        <Text style={dynamic.title}>Research</Text>
        <View style={dynamic.headerSpacer} />
      </View>

      <View style={dynamic.searchContainer}>
        <View style={dynamic.searchBar}>
          <View style={dynamic.searchIconContainer}>
            <Search size={20} color={theme.colors.textMuted} />
          </View>
          <TextInput
            style={dynamic.searchInput}
            placeholder="Search for a country..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={dynamic.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? theme.colors.primary : theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={dynamic.filtersContainer}>
            <Text style={dynamic.filtersTitle}>Filters</Text>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Max Calories:</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. 300"
                value={searchFilters.maxCalories?.toString() || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  maxCalories: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Min Protein (g):</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. 10"
                value={searchFilters.minProtein?.toString() || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  minProtein: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Category:</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. dairy, meat, vegetables"
                value={searchFilters.category || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  category: text || undefined
                }))}
              />
            </View>
            
            <TouchableOpacity 
              style={dynamic.clearFiltersButton}
              onPress={() => setSearchFilters({})}
            >
              <X size={16} color="#666" />
              <Text style={dynamic.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {searchQuery.length > 2 && (
        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>
            Search Results {Object.keys(searchFilters).length > 0 && '(Filtered)'}
          </Text>
          {isSearching ? (
            <Text style={dynamic.loadingText}>Searching...</Text>
          ) : searchResults.length === 0 ? (
            <Text style={dynamic.emptyText}>No foods found for &quot;{searchQuery}&quot;</Text>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={dynamic.gridRow}
              contentContainerStyle={dynamic.searchResultsList}
            />
          )}
        </View>
      )}
      
      {!searchQuery && searchFilters.category && (
        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>
            {searchFilters.category.charAt(0).toUpperCase() + searchFilters.category.slice(1)} Foods
          </Text>
          {isLoadingCategory ? (
            <Text style={dynamic.loadingText}>Loading category foods...</Text>
          ) : categoryResults.length === 0 ? (
            <Text style={dynamic.emptyText}>No foods found in this category</Text>
          ) : (
            <FlatList
              data={categoryResults}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={dynamic.gridRow}
              contentContainerStyle={dynamic.searchResultsList}
            />
          )}
        </View>
      )}

      {searchQuery.length <= 2 && !searchFilters.category && (
        <>
          <View style={dynamic.section}>
            <FlatList
              data={COUNTRIES_FOODS}
              renderItem={renderCountryButton}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={dynamic.countryList}
            />
          </View>

          {selectedCountry && (
            <View style={dynamic.section}>
              <Text style={dynamic.sectionTitle}>
                {COUNTRIES_FOODS.find(c => c.code === selectedCountry)?.country} Foods
              </Text>
              
              {isLoadingCountry ? (
                <Text style={dynamic.loadingText}>Loading foods...</Text>
              ) : countryFoods.length === 0 ? (
                <Text style={dynamic.emptyText}>No foods available for this country yet.</Text>
              ) : (
                <FlatList
                  data={countryFoods}
                  renderItem={renderFoodItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  numColumns={2}
                  columnWrapperStyle={dynamic.gridRow}
                  contentContainerStyle={dynamic.searchResultsList}
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Theme.colors.background,
  },
  headerSpacer: {
    width: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Theme.colors.text,
    flex: 1,
    textAlign: 'center' as const,
    letterSpacing: -0.4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    height: 48,
    overflow: 'hidden',
  },
  searchIconContainer: {
    paddingLeft: 16,
    paddingRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text,
    paddingHorizontal: 8,
    paddingLeft: 8,
    height: 48,
  },
  section: {
    flex: 1,
  },
  countryList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 4,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 12,
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  countryFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Theme.colors.text,
    flex: 1,
  },
  chevronContainer: {
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
    fontStyle: 'italic',
  },
  searchResultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 4,
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0066FF20',
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.primary700,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    width: 120,
    fontWeight: '500',
  },
  filterInput: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
});
