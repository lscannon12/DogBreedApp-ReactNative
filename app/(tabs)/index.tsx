import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Breed {
  name: string;
  imageUrl: string;
}

export default function HomeScreen() {
  const [dogBreeds, setDogBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchDogBreeds() {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all');
        const data = await response.json();
        const breedNames = Object.keys(data.message);

        const breedsWithImages = await Promise.all(
          breedNames.map(async (breed) => {
            const breedImageResponse = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
            const imageData = await breedImageResponse.json();
            return { name: breed, imageUrl: imageData.message };
          })
        );

        setDogBreeds(breedsWithImages);
      } catch (error) {
        console.error('Error fetching dog breeds:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDogBreeds();
  }, []);

  const filteredBreeds = dogBreeds.filter((breed) =>
    breed.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText>Loading Dog Breeds...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a breed..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredBreeds}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.breedContainer} onPress={() => console.log(item.name)}>
            <Image source={{ uri: item.imageUrl }} style={styles.breedImage} />
            <ThemedText style={styles.breedName}>{item.name}</ThemedText>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome to Dog Breeds!</ThemedText>
          </ThemedView>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    width: '80%'
  },
  breedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  breedImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  breedName: {
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 16,
  },
});
