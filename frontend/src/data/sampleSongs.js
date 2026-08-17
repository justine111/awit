// Sample songs to demonstrate the data model. Replace with your own
// lyrics (make sure you have the right to display them — CCLI covers
// most congregational songs in the Philippines too).
//
// A song is a list of "slides". Each slide is one screen's worth of
// text. Splitting lyrics into slides ahead of time (rather than one
// giant block) is what lets the operator jump straight to "Chorus"
// or repeat it without re-typing anything live.

export const sampleSongs = [
  {
    title: 'Great Is Your Faithfulness (Sample)',
    ccli: '',
    slides: [
      { label: 'Verse 1', lines: ['Great is Your faithfulness, O God my Father,', 'There is no shadow of turning with Thee;', 'Thou changest not, Thy compassions they fail not,', 'As Thou hast been Thou forever wilt be.'] },
      { label: 'Chorus', lines: ['Great is Thy faithfulness! Great is Thy faithfulness!', 'Morning by morning new mercies I see;', 'All I have needed Thy hand hath provided —', 'Great is Thy faithfulness, Lord, unto me!'] },
      { label: 'Verse 2', lines: ['Summer and winter, and springtime and harvest,', 'Sun, moon and stars in their courses above,', 'Join with all nature in manifold witness', 'To Thy great faithfulness, mercy and love.'] },
      { label: 'Chorus', lines: ['Great is Thy faithfulness! Great is Thy faithfulness!', 'Morning by morning new mercies I see;', 'All I have needed Thy hand hath provided —', 'Great is Thy faithfulness, Lord, unto me!'] },
    ],
  },
  {
    title: 'Way Maker (Sample)',
    ccli: '',
    slides: [
      { label: 'Verse', lines: ['You are here, moving in our midst,', 'I worship You, I worship You.', 'You are here, working in this place,', 'I worship You, I worship You.'] },
      { label: 'Chorus', lines: ['Way maker, miracle worker,', 'Promise keeper, light in the darkness,', 'My God, that is who You are.'] },
    ],
  },
  {
    title: 'How Great Thou Art (Sample)',
    ccli: '',
    slides: [
      { label: 'Verse 1', lines: ['O Lord my God, when I in awesome wonder,', 'Consider all the worlds Thy hands have made,', 'I see the stars, I hear the rolling thunder,', 'Thy power throughout the universe displayed.'] },
      { label: 'Chorus', lines: ['Then sings my soul, my Savior God, to Thee,', 'How great Thou art, how great Thou art!', 'Then sings my soul, my Savior God, to Thee,', 'How great Thou art, how great Thou art!'] },
    ],
  },
]
