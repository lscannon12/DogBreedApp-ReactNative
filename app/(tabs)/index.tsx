import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
  Text
} from 'react-native';

interface Breed {
  name: string;
  imageUrl: string;
  temperament?: string;
}

export default function HomeScreen() {
  const [dogBreeds, setDogBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const temperamentResponse = await fetch('https://api.thedogapi.com/v1/breeds');
        if (!temperamentResponse.ok) throw new Error('Failed to fetch temperaments');
        const temperamentData = await temperamentResponse.json();

        const breedsWithTemperaments = temperamentData.map((breed: any) => ({
          name: breed.name || 'Unknown',
          temperament: breed.temperament || 'No temperament info',
        }));

        const breedsWithImagesPromises = breedsWithTemperaments.map(async (breed) => {
          try {
            const breedImageResponse = await fetch(`https://dog.ceo/api/breed/${breed.name.toLowerCase()}/images/random`);
            if (!breedImageResponse.ok) throw new Error('Failed to fetch breed image');
            const imageData = await breedImageResponse.json();
            return {
              name: breed.name,
              imageUrl: imageData.message
            };
          } catch {
            return null;
          }
        });

        const breedsWithImages = (await Promise.all(breedsWithImagesPromises)).filter(imageData => imageData !== null) as Breed[];

        const combinedBreeds = breedsWithTemperaments
          .filter(breed => breedsWithImages.some(imgBreed => imgBreed.name.toLowerCase() === breed.name.toLowerCase()))
          .map(breed => ({
            ...breed,
            imageUrl: breedsWithImages.find(imgBreed => imgBreed.name.toLowerCase() === breed.name.toLowerCase())?.imageUrl || 'https://via.placeholder.com/50?text=Image+Not+Found',
          }));

        setDogBreeds(combinedBreeds);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBreeds = dogBreeds.filter((breed) =>
    breed.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Dog Breeds...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>{error}</Text>
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
          <TouchableOpacity style={styles.breedContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.breedImage} />
            <View>
              <Text style={styles.breedName}>{item.name}</Text>
              <Text style={styles.breedTemperament}>Temperament: {item.temperament}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Dog Breeds!</Text>
          </View>
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
  breedTemperament: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
