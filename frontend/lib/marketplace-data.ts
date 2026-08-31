export type MarketplaceAction = {
  id: string
  rank: number
  item: string
  buyer: string
  ask: number
  offer?: number
  signal: string
  move: string
  reason: string
  draft: string
  urgency: 'Now' | 'Today' | 'Verify' | 'Backup'
  received: string
  note?: string
}

export type PipelineRow = {
  item: string
  asking: number
  onTableMyr: number
  lead: string
  signal: string
  status: 'Close now' | 'Offer' | 'Fresh' | 'Watch'
  next: string
}

export const snapshotLabel = '31 Aug, 3:31 PM SGT'
export const myrPerUsd = 4.0275

export const marketplaceActions: MarketplaceAction[] = [
  {
    id: 'murtaza-bike', rank: 1, item: 'Mountain Bike', buyer: 'Murtaza', ask: 190, offer: 190,
    signal: 'Full-price offer', move: 'Accept RM190 and lock a pickup time', urgency: 'Now', received: 'Waiting since Saturday',
    reason: 'Murtaza offered the full asking price. This is the clearest intent and the shortest path to a completed sale.',
    draft: 'Hi Murtaza, I can accept RM190. Pickup is at Forest City Marina Hotel. Please send an exact collection time; I can confirm the sale once we agree on pickup.',
  },
  {
    id: 'ahmad-fender', rank: 2, item: 'Fender Champion 40', buyer: 'Ahmad', ask: 490, offer: 400,
    signal: 'Specific RM400 offer', move: 'Counter once at RM450', urgency: 'Now', received: 'Open negotiation',
    reason: 'Ahmad named a real number. RM450 splits the gap and protects value while keeping the negotiation easy to close.',
    draft: 'Hi Ahmad, thanks for the RM400 offer. I can meet you at RM450. Pickup is at Forest City Marina Hotel. If that works, what day and time can you collect?',
  },
  {
    id: 'danny-tv', rank: 3, item: 'TCL 98-inch TV', buyer: 'Danny', ask: 10000,
    signal: 'Availability check', move: 'Hold RM10,000 and qualify transport', urgency: 'Today', received: 'Fresh high-value lead',
    reason: 'The TV has active interest and significant value. Confirm transport and collection readiness before discussing price.',
    draft: 'Hi Danny, yes, the TCL 98C8K is available at RM10,000. Pickup is at Forest City Marina Hotel. Please confirm you have suitable transport and tell me when you could collect.',
    note: 'Tim owns this item. Tim must approve any price move or sale commitment.',
  },
  {
    id: 'anand-maudio', rank: 4, item: 'M-Audio Monitor Pair', buyer: 'Anand', ask: 200,
    signal: 'New availability inquiry', move: 'Hold RM200 and request an exact pickup time', urgency: 'Today', received: 'Today, 12:38 PM',
    reason: 'Anand is the newest inquiry on the speaker pair. The asking price is already competitive, so test collection intent before discussing a discount.',
    draft: 'Hi Anand, yes, the M-Audio speaker pair is available for RM200. Pickup is at Forest City Marina Hotel. What day and exact time can you collect?',
  },
  {
    id: 'kartikan-cajon', rank: 5, item: 'Cajon Bundle', buyer: 'Kartikan', ask: 140,
    signal: 'New unread availability inquiry', move: 'Hold RM140 and ask for an exact pickup time', urgency: 'Today', received: 'Today, 3:31 PM',
    reason: 'Kartikan is the newest Cajon lead. The item already has multiple interested buyers, so keep the price at RM140 and qualify collection timing.',
    draft: 'Hi Kartikan, yes, the cajon percussion bundle is available for RM140. Pickup is at Forest City Marina Hotel. What exact day and time can you collect?',
  },
  {
    id: 'hamka-cajon', rank: 6, item: 'Cajon Bundle', buyer: 'Hamka', ask: 140,
    signal: 'New availability inquiry', move: 'Hold RM140 and request an exact pickup time', urgency: 'Today', received: 'Today, 2:31 PM',
    reason: 'Hamka is another current Cajon inquiry. The listing has strong traffic, so hold RM140 and test collection intent before negotiating.',
    draft: 'Hi Hamka, ya, cajon dan bundle perkusi masih ada pada harga RM140. Pickup di Forest City Marina Hotel. Bila tarikh dan masa tepat anda boleh ambil?',
  },
  {
    id: 'mohd-bike', rank: 7, item: 'Mountain Bike', buyer: 'Mohd', ask: 190,
    signal: 'New unread inquiry', move: 'Keep as first backup to Murtaza', urgency: 'Today', received: 'Today, 11:19 AM',
    reason: 'Mohd is the newest bike inquiry, but Murtaza already offered full price. Ask for the earliest collection time without promising the item twice.',
    draft: 'Hi Mohd, another buyer has offered the full RM190. If you can collect from Forest City Marina Hotel, please send your earliest pickup time and I will confirm whether it is still available.',
  },
  {
    id: 'suria-drums', rank: 8, item: 'German-brand Drum Kit', buyer: 'Suria', ask: 590,
    signal: 'Fresh inquiry', move: 'Hold RM590 and qualify transport', urgency: 'Today', received: 'Today, 6:30 AM',
    reason: 'A full drum kit needs suitable transport. Confirm logistics before spending time on scheduling or negotiation.',
    draft: 'Hi Suria, the drum kit is available at RM590. Pickup is at Forest City Marina Hotel and you will need suitable transport. What day and time could you collect?',
  },
  {
    id: 'samri-cajon', rank: 9, item: 'Cajon Bundle', buyer: 'Samri', ask: 140,
    signal: 'Fresh inquiry', move: 'Hold RM140 and ask for an exact time', urgency: 'Today', received: 'Today, 6:19 AM',
    reason: 'Samri is a fresh lead at an already reduced price. Test collection intent before offering another discount.',
    draft: 'Hi Samri, the cajon percussion bundle is available at RM140. Pickup is at Forest City Marina Hotel. What exact day and time could you collect?',
  },
  {
    id: 'shaaban-bass', rank: 10, item: '6-string Bass', buyer: 'Sha’aban', ask: 590,
    signal: 'General interest', move: 'Hold RM590 and ask for pickup timing', urgency: 'Today', received: 'Sunday',
    reason: 'The bass has a new buyer signal but no price discussion. Move the conversation to a concrete collection time before negotiating.',
    draft: 'Hi Sha’aban, the 6-string bass is available at RM590. Pickup is at Forest City Marina Hotel. What day and time could you collect?',
  },
  {
    id: 'kangwei-ukulele', rank: 11, item: 'Ukulele', buyer: 'Kangwei', ask: 90,
    signal: 'Asked for the brand', move: 'Verify the brand marking before replying', urgency: 'Verify', received: 'Fresh product question',
    reason: 'Kangwei asked a factual product question. Inspect the headstock or label first so the reply is accurate and useful.',
    draft: 'Hi Kangwei, I’m checking the brand marking now and will confirm it before you make a trip. The asking price is RM90 and pickup is at Forest City Marina Hotel.',
    note: 'Do not use this draft until the brand marking has been checked.',
  },
  {
    id: 'sufiyan-bike', rank: 12, item: 'Mountain Bike', buyer: 'Sufiyan', ask: 190,
    signal: 'Generic inquiry', move: 'Keep as second backup', urgency: 'Backup', received: 'Today, 10:00 AM',
    reason: 'Two stronger bike leads are already ahead. Keep Sufiyan warm only if the full-price buyer does not schedule.',
    draft: 'Hi Sufiyan, the bike has active interest at RM190. If you can collect from Forest City Marina Hotel, please send your earliest pickup time and I will confirm availability.',
  },
]

export const marketplacePipeline: PipelineRow[] = [
  { item: 'Mountain Bike', asking: 190, onTableMyr: 190, lead: 'Murtaza + 3 backups', signal: 'Full-price RM190 offer', status: 'Close now', next: 'Schedule pickup' },
  { item: 'Fender Champion 40', asking: 490, onTableMyr: 400, lead: 'Ahmad', signal: 'Specific RM400 offer', status: 'Offer', next: 'Counter RM450' },
  { item: 'TCL 98-inch TV', asking: 10000, onTableMyr: 0, lead: 'Danny', signal: 'Availability check', status: 'Fresh', next: 'Qualify transport' },
  { item: 'German-brand Drum Kit', asking: 590, onTableMyr: 0, lead: 'Suria', signal: 'Fresh inquiry', status: 'Fresh', next: 'Qualify transport' },
  { item: 'Cajon Bundle', asking: 140, onTableMyr: 0, lead: 'Kartikan + 2', signal: 'Newest inquiry at 3:31 PM', status: 'Fresh', next: 'Ask pickup time' },
  { item: '6-string Bass', asking: 590, onTableMyr: 0, lead: 'Sha’aban', signal: 'General interest', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Ukulele', asking: 90, onTableMyr: 0, lead: 'Kangwei', signal: 'Asked for brand', status: 'Fresh', next: 'Verify brand' },
  { item: 'Air Purifier', asking: 150, onTableMyr: 0, lead: 'Zainul + 1', signal: 'Recent message cluster', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Arturia MiniLab MkII', asking: 270, onTableMyr: 0, lead: 'Dam', signal: 'Recent message', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'M-Audio Monitor Pair', asking: 200, onTableMyr: 0, lead: 'Anand', signal: 'Asked if available', status: 'Fresh', next: 'Ask pickup time' },
  { item: 'Amazon Echo', asking: 120, onTableMyr: 0, lead: 'None', signal: 'Price test live after 47 clicks', status: 'Watch', next: 'Reassess after 24 hours' },
  { item: 'Acoustic-Electric Guitar', asking: 480, onTableMyr: 0, lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Acoustic Guitar', asking: 190, onTableMyr: 0, lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
  { item: 'Squier Stratocaster', asking: 490, onTableMyr: 0, lead: 'None fresh', signal: 'No fresh preview', status: 'Watch', next: 'Hold and monitor' },
]
