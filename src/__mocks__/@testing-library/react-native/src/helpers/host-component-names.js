// Mock cho detectHostComponentNames để tránh lỗi "Can't access .root on unmounted test renderer"
const mockHostComponents = {
  text: 'Text',
  textInput: 'TextInput',
  view: 'View',
  scrollView: 'ScrollView',
  image: 'Image',
  touchableOpacity: 'TouchableOpacity',
  touchableHighlight: 'TouchableHighlight',
  touchableWithoutFeedback: 'TouchableWithoutFeedback',
  flatList: 'FlatList',
  sectionList: 'SectionList',
};

// Cache ngay lập tức để tránh detect
let cachedNames = mockHostComponents;

function detectHostComponentNames() {
  // Trả về cached names ngay lập tức, không cố gắng detect
  return cachedNames;
}

// Set cache ngay
detectHostComponentNames._cachedHostComponentNames = cachedNames;

module.exports = {
  detectHostComponentNames,
  _cachedHostComponentNames: cachedNames,
};

