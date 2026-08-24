/* ============================================================
   VAN OPS — the fiction
   ALL character / location / prop names live in FICTION below.
   Change them once here and every monitor updates.
   ============================================================ */
(function (global) {
  'use strict';

  const FICTION = {
    operator:  'LEO',
    handle:    'GHOSTLINE',
    partner:   'RAVEN',            // the girl on the inside
    partnerFull: 'M. VANCE',
    estate:    'HALLOWELL HOUSE',
    address:   '1180 HALLOWELL RD',
    owner:     'A. R. KESTREL',
    shipper:   'MERIDIAN FREIGHT & BONDED WAREHOUSE',
    shipperShort: 'MERIDIAN',
    vessel:    'MV CORMORANT STRAIT',
    container: 'MRDU 4471902',
    seal:      '88214',
    bol:       'MFB-2291-0447',
    secVendor: 'ARGUS PERIMETER SYSTEMS',
    van:       'UNIT 7 · WHITE PANEL',
    domain:    'meridian-bonded.net',
    subnet:    '10.42.7',
    cameraNet: '10.42.9'
  };

  /* ---------------- FLOOR PLANS ----------------
     Coordinates live in a 1000 x 700 viewBox.
     kind: 'room' | 'vault' | 'service' | 'circulation' | 'target'
  ------------------------------------------------ */
  const FLOORS = [
    {
      id: 'B1', name: 'BASEMENT', sub: 'SUB-LEVEL 01 · 4.2 M BELOW GRADE',
      envelope: { x: 100, y: 100, w: 800, h: 500 },
      rooms: [
        { id: 'b1-cellar', name: 'WINE CELLAR',      x: 100, y: 100, w: 620, h: 120, kind: 'room' },
        { id: 'b1-stair',  name: 'STAIR FOOT',       x: 720, y: 100, w: 180, h: 120, kind: 'circulation' },
        { id: 'b1-cold',   name: 'COLD STORE',       x: 100, y: 220, w: 200, h:  90, kind: 'service' },
        { id: 'b1-corr',   name: 'SERVICE PASSAGE',  x: 300, y: 220, w: 420, h:  90, kind: 'circulation' },
        { id: 'b1-plant',  name: 'PLANT ROOM',       x: 720, y: 220, w: 180, h: 180, kind: 'service' },
        { id: 'b1-arch',   name: 'ARCHIVE / CRATES', x: 100, y: 310, w: 300, h: 290, kind: 'room' },
        { id: 'b1-ante',   name: 'ANTECHAMBER',      x: 400, y: 310, w: 180, h: 290, kind: 'room' },
        { id: 'b1-vault',  name: 'VAULT',            x: 580, y: 310, w: 140, h: 290, kind: 'vault' },
        { id: 'b1-sec',    name: 'SECURITY HEAD-END',x: 720, y: 400, w: 180, h: 200, kind: 'target' }
      ],
      doors: [
        { x: 810, y: 220, dir: 'h', w: 46, id: 'd-b1-stair', name: 'STAIR FOOT' },
        { x: 720, y: 265, dir: 'v', w: 46, id: 'd-b1-plant', name: 'PLANT' },
        { x: 720, y: 500, dir: 'v', w: 46, id: 'd-b1-sec',   name: 'SECURITY DOOR', lock: 'MAG' },
        { x: 300, y: 265, dir: 'v', w: 46, id: 'd-b1-cold',  name: 'COLD STORE' },
        { x: 470, y: 310, dir: 'h', w: 46, id: 'd-b1-ante',  name: 'ANTECHAMBER' },
        { x: 580, y: 455, dir: 'v', w: 60, id: 'd-b1-vault', name: 'VAULT DOOR', lock: 'MAG', hero: true },
        { x: 400, y: 430, dir: 'v', w: 46, id: 'd-b1-arch',  name: 'ARCHIVE' }
      ],
      stairs: [{ x: 740, y: 110, w: 140, h: 100, dir: 'up', label: 'SERVANT STAIR' }],
      sensors: [
        { id: 's-b1-1', x: 700, y: 332, type: 'PIR',   zone: 6 },
        { id: 's-b1-2', x: 600, y: 582, type: 'PIR',   zone: 6 },
        { id: 's-b1-3', x: 560, y: 332, type: 'PIR',   zone: 5 },
        { id: 's-b1-4', x: 124, y: 332, type: 'PIR',   zone: 5 },
        { id: 's-b1-5', x: 640, y: 238, type: 'BEAM',  zone: 5 },
        { id: 's-b1-6', x: 700, y: 512, type: 'PRESS', zone: 6 },
        { id: 's-b1-7', x: 878, y: 240, type: 'TEMP',  zone: 4 }
      ],
      cameras: [
        { id: 'CAM-07', x: 888, y: 112, a: 132, fov: 62, range: 210 },
        { id: 'CAM-08', x: 410, y: 322, a:  55, fov: 66, range: 260 }
      ],
      patrol: [[810, 160], [810, 300], [700, 265], [420, 265], [250, 265], [250, 470], [420, 470], [520, 470], [520, 340], [810, 340], [810, 160]],
      notes: 'Vault: 300mm reinforced concrete, single door, no conduit penetration except 40mm alarm riser at NE corner.'
    },
    {
      id: 'L1', name: 'GROUND FLOOR', sub: 'PRINCIPAL LEVEL · GRADE',
      envelope: { x: 60, y: 60, w: 880, h: 580 },
      rooms: [
        { id: 'l1-drawing', name: 'DRAWING ROOM',     x:  60, y:  60, w: 300, h: 240, kind: 'room' },
        { id: 'l1-dining',  name: 'DINING HALL',      x: 360, y:  60, w: 280, h: 240, kind: 'room' },
        { id: 'l1-kitchen', name: 'KITCHEN',          x: 640, y:  60, w: 300, h: 200, kind: 'service' },
        { id: 'l1-service', name: 'SERVICE CORRIDOR', x: 640, y: 260, w: 300, h:  80, kind: 'circulation' },
        { id: 'l1-library', name: 'LIBRARY',          x:  60, y: 300, w: 300, h: 170, kind: 'room' },
        { id: 'l1-stair',   name: 'STAIR HALL',       x: 360, y: 300, w: 240, h: 170, kind: 'circulation' },
        { id: 'l1-gallery', name: 'GALLERY',          x: 600, y: 340, w: 340, h: 300, kind: 'target' },
        { id: 'l1-cons',    name: 'CONSERVATORY',     x:  60, y: 470, w: 340, h: 170, kind: 'room' },
        { id: 'l1-foyer',   name: 'GRAND FOYER',      x: 400, y: 470, w: 200, h: 170, kind: 'circulation' }
      ],
      doors: [
        { x: 500, y: 640, dir: 'h', w: 70, id: 'd-l1-main',  name: 'MAIN ENTRANCE', ext: true },
        { x: 940, y: 300, dir: 'v', w: 52, id: 'd-l1-svc',   name: 'SERVICE DOOR', ext: true, lock: 'MAG', hero: true },
        { x: 200, y:  60, dir: 'h', w: 60, id: 'd-l1-fren',  name: 'FRENCH DOORS', ext: true },
        { x: 360, y: 180, dir: 'v', w: 46, id: 'd-l1-dr' },
        { x: 500, y: 300, dir: 'h', w: 52, id: 'd-l1-dn' },
        { x: 360, y: 385, dir: 'v', w: 46, id: 'd-l1-lib' },
        { x: 640, y: 160, dir: 'v', w: 46, id: 'd-l1-kit' },
        { x: 790, y: 260, dir: 'h', w: 46, id: 'd-l1-svck' },
        { x: 790, y: 340, dir: 'h', w: 46, id: 'd-l1-gal' },
        { x: 500, y: 470, dir: 'h', w: 60, id: 'd-l1-foy' },
        { x: 400, y: 555, dir: 'v', w: 46, id: 'd-l1-cons' },
        { x: 600, y: 555, dir: 'v', w: 46, id: 'd-l1-galf' }
      ],
      stairs: [
        { x: 380, y: 320, w: 200, h: 130, dir: 'up', label: 'GRAND STAIR' },
        { x: 855, y: 268, w:  74, h:  50, dir: 'down', label: 'SERVANT STAIR' }
      ],
      sensors: [
        { id: 's-l1-1', x: 330, y:  84, type: 'PIR',  zone: 1 },
        { id: 's-l1-2', x: 612, y:  84, type: 'PIR',  zone: 1 },
        { id: 's-l1-3', x: 912, y:  84, type: 'PIR',  zone: 2 },
        { id: 's-l1-4', x: 912, y: 366, type: 'PIR',  zone: 3 },
        { id: 's-l1-5', x:  84, y: 326, type: 'GLASS',zone: 1 },
        { id: 's-l1-6', x: 574, y: 496, type: 'PIR',  zone: 1 },
        { id: 's-l1-7', x: 886, y: 331, type: 'DOOR', zone: 2 },
        { id: 's-l1-8', x:  84, y: 618, type: 'GLASS',zone: 3 }
      ],
      cameras: [
        { id: 'CAM-03', x: 412, y: 486, a:  42, fov: 70, range: 210 },
        { id: 'CAM-04', x: 612, y: 352, a:  45, fov: 74, range: 300 },
        { id: 'CAM-05', x: 652, y: 272, a:  10, fov: 58, range: 260 },
        { id: 'CAM-06', x: 372, y: 312, a:  30, fov: 66, range: 220 }
      ],
      patrol: [[500, 600], [500, 400], [420, 330], [200, 330], [200, 180], [500, 180], [790, 180], [790, 300], [790, 500], [660, 600], [500, 600]],
      notes: 'Service door is the soft entry — Argus keypad, no camera overlap between 02:10 and 02:14 sweep.'
    },
    {
      id: 'L2', name: 'UPPER FLOOR', sub: 'PRIVATE LEVEL',
      envelope: { x: 60, y: 60, w: 880, h: 580 },
      rooms: [
        { id: 'l2-master', name: 'MASTER SUITE',   x:  60, y:  60, w: 340, h: 260, kind: 'room' },
        { id: 'l2-guest1', name: 'GUEST BEDROOM',  x: 400, y:  60, w: 240, h: 280, kind: 'room' },
        { id: 'l2-guest2', name: 'GUEST BEDROOM',  x: 640, y:  60, w: 300, h: 200, kind: 'room' },
        { id: 'l2-linen',  name: 'LINEN / RISER',  x: 640, y: 260, w: 300, h:  80, kind: 'service' },
        { id: 'l2-bath',   name: 'ENSUITE',        x:  60, y: 320, w: 180, h: 150, kind: 'service' },
        { id: 'l2-dress',  name: 'DRESSING',       x: 240, y: 320, w: 160, h: 150, kind: 'room' },
        { id: 'l2-land',   name: 'GALLERY LANDING',x: 400, y: 340, w: 200, h: 300, kind: 'circulation' },
        { id: 'l2-guest3', name: 'GUEST BEDROOM',  x: 600, y: 340, w: 340, h: 300, kind: 'room' },
        { id: 'l2-study',  name: 'PRIVATE STUDY',  x:  60, y: 470, w: 340, h: 170, kind: 'target' }
      ],
      doors: [
        { x: 400, y: 200, dir: 'v', w: 46, id: 'd-l2-m' },
        { x: 500, y: 340, dir: 'h', w: 52, id: 'd-l2-g1' },
        { x: 640, y: 160, dir: 'v', w: 46, id: 'd-l2-g2' },
        { x: 790, y: 260, dir: 'h', w: 46, id: 'd-l2-lin' },
        { x: 150, y: 320, dir: 'h', w: 46, id: 'd-l2-bath' },
        { x: 320, y: 320, dir: 'h', w: 46, id: 'd-l2-dr' },
        { x: 400, y: 555, dir: 'v', w: 46, id: 'd-l2-study', lock: 'MAG', hero: true },
        { x: 600, y: 490, dir: 'v', w: 46, id: 'd-l2-g3' },
        { x: 860, y: 300, dir: 'h', w: 46, id: 'd-l2-svc' }
      ],
      stairs: [
        { x: 420, y: 360, w: 160, h: 130, dir: 'down', label: 'GRAND STAIR' },
        { x: 855, y: 268, w:  74, h:  50, dir: 'down', label: 'SERVANT STAIR' }
      ],
      sensors: [
        { id: 's-l2-1', x: 372, y:  84, type: 'PIR',  zone: 4 },
        { id: 's-l2-2', x: 612, y:  84, type: 'PIR',  zone: 4 },
        { id: 's-l2-3', x: 912, y:  84, type: 'PIR',  zone: 4 },
        { id: 's-l2-4', x:  84, y: 618, type: 'PIR',  zone: 4 },
        { id: 's-l2-5', x: 372, y: 496, type: 'SAFE', zone: 4 },
        { id: 's-l2-6', x: 912, y: 366, type: 'PIR',  zone: 4 }
      ],
      cameras: [{ id: 'CAM-10', x: 412, y: 352, a: 55, fov: 68, range: 260 }],
      patrol: [[500, 620], [500, 400], [400, 380], [230, 380], [230, 180], [500, 180], [790, 180], [790, 300], [790, 500], [500, 620]],
      notes: 'Study holds the Argus keypad head unit and a 2nd-gen wall safe. Not the target — but it is where the paperwork lives.'
    }
  ];

  /* Infiltration route, drawn floor by floor. */
  const ROUTE = {
    L1: [[980, 300], [900, 300], [800, 300], [700, 300], [660, 300], [660, 290], [880, 290], [880, 300]],
    B1: [[810, 150], [810, 260], [700, 265], [520, 265], [470, 300], [470, 430], [520, 470], [600, 470], [645, 455]],
    L2: []
  };

  /* ---------------- CAMERA WALL ---------------- */
  const CAMERAS = [
    { id: 'CAM-01', name: 'FRONT GATE',      scene: 'gate',    floor: 'EXT', ip: '.11' },
    { id: 'CAM-02', name: 'APPROACH DRIVE',  scene: 'drive',   floor: 'EXT', ip: '.12' },
    { id: 'CAM-03', name: 'GRAND FOYER',     scene: 'foyer',   floor: 'L1',  ip: '.13' },
    { id: 'CAM-04', name: 'GALLERY',         scene: 'gallery', floor: 'L1',  ip: '.14' },
    { id: 'CAM-05', name: 'SERVICE CORRIDOR',scene: 'corridor',floor: 'L1',  ip: '.15' },
    { id: 'CAM-06', name: 'STAIR HALL',      scene: 'stair',   floor: 'L1',  ip: '.16' },
    { id: 'CAM-07', name: 'CELLAR STAIR',    scene: 'cellar',  floor: 'B1',  ip: '.17' },
    { id: 'CAM-08', name: 'VAULT ANTECHAMBER',scene:'vault',   floor: 'B1',  ip: '.18' },
    { id: 'CAM-09', name: 'REAR LAWN',       scene: 'lawn',    floor: 'EXT', ip: '.19' }
  ];

  /* ---------------- SHIPPING MANIFEST (the payoff) ---------------- */
  const MANIFEST = {
    bol: FICTION.bol,
    container: FICTION.container,
    seal: FICTION.seal,
    vessel: FICTION.vessel,
    voyage: 'V.114-E',
    loadPort: 'GENOA, IT  (ITGOA)',
    dischargePort: 'PORT NEWARK, NJ  (USNWK)',
    eta: '11 NOV  04:20',
    consignee: 'KESTREL HOLDINGS LLC',
    notify: FICTION.owner,
    declared: 'ARCHITECTURAL SALVAGE — MARBLE OFFCUTS, NO COMMERCIAL VALUE',
    declaredWeight: '2,140 KG',
    actualWeight: '2,318 KG',
    finalDelivery: FICTION.address,
    lines: [
      { lot: 'HC-0114', declared: 'MARBLE OFFCUT, CRATED', actual: 'RHYTON, GILT SILVER, LION PROTOME',   qty: 1, kg: 4.2,  val: '1,900,000', flag: 'RESTRICTED' },
      { lot: 'HC-0118', declared: 'MARBLE OFFCUT, CRATED', actual: 'FIGURE, MARBLE, CYCLADIC TYPE, 24CM', qty: 1, kg: 2.8,  val: '2,400,000', flag: 'RESTRICTED' },
      { lot: 'HC-0122', declared: 'PAPER WASTE, BALED',    actual: 'PSALTER, VELLUM, 41 LEAVES, ILLUM.',  qty: 1, kg: 3.1,  val: '870,000',   flag: 'RESTRICTED' },
      { lot: 'HC-0130', declared: 'STONE SAMPLES',         actual: 'BI DISCS, JADE, PAIR',                qty: 2, kg: 1.9,  val: '1,150,000', flag: 'RESTRICTED' },
      { lot: 'HC-0141', declared: 'SCRAP NON-FERROUS',     actual: 'VOTIVE FIGURE, BRONZE, 19CM',         qty: 1, kg: 2.2,  val: '640,000',   flag: 'RESTRICTED' },
      { lot: 'HC-0155', declared: 'SCRAP NON-FERROUS',     actual: 'TORC FRAGMENT, GOLD, 88.4G',          qty: 1, kg: 0.1,  val: '410,000',   flag: 'RESTRICTED' },
      { lot: 'HC-0161', declared: 'PACKING TIMBER',        actual: 'CRATE — SEALED, NOT SCANNED',         qty: 3, kg: 118,  val: 'UNDECLARED', flag: 'DARK' }
    ],
    chain: [
      ['11 NOV 04:20', 'DISCHARGED', 'PORT NEWARK — BERTH 4'],
      ['11 NOV 09:02', 'BONDED HOLD', FICTION.shipperShort + ' WAREHOUSE 3'],
      ['12 NOV 23:41', 'SEAL BROKEN', 'NO CUSTOMS OFFICER LOGGED'],
      ['13 NOV 01:15', 'RE-SEALED',   'SEAL 88214 → 88214 (DUPLICATE)'],
      ['13 NOV 02:50', 'DEPARTED',    'TRUCK 7742 — DRIVER ID SCRUBBED'],
      ['13 NOV 05:38', 'DELIVERED',   FICTION.address + ' — SERVICE ENTRANCE'],
      ['13 NOV 05:52', 'GPS ENDS',    'TRACKER DISABLED ON SITE']
    ]
  };

  /* ---------------- NETWORK GRAPH ---------------- */
  const NETWORK = {
    nodes: [
      { id: 'wan',   name: 'ISP HANDOFF',      type: 'edge',   x: 0.10, y: 0.50, ip: '203.0.113.44', phase: 0 },
      { id: 'fw',    name: 'EDGE FIREWALL',    type: 'sec',    x: 0.26, y: 0.50, ip: '10.42.7.1',    phase: 1 },
      { id: 'sw',    name: 'CORE SWITCH',      type: 'net',    x: 0.42, y: 0.50, ip: '10.42.7.2',    phase: 1 },
      { id: 'ap',    name: 'WAP · GUEST',      type: 'net',    x: 0.42, y: 0.20, ip: '10.42.7.9',    phase: 1 },
      { id: 'nvr',   name: 'NVR · 16CH',       type: 'cam',    x: 0.62, y: 0.20, ip: '10.42.9.10',   phase: 2 },
      { id: 'cams',  name: 'CAMERA VLAN',      type: 'cam',    x: 0.82, y: 0.14, ip: '10.42.9.0/24', phase: 2 },
      { id: 'alarm', name: 'ARGUS PANEL',      type: 'sec',    x: 0.62, y: 0.50, ip: '10.42.7.30',   phase: 2 },
      { id: 'door',  name: 'DOOR CONTROLLER',  type: 'sec',    x: 0.82, y: 0.44, ip: '10.42.7.31',   phase: 3 },
      { id: 'bms',   name: 'BMS · HVAC/POWER', type: 'ops',    x: 0.62, y: 0.80, ip: '10.42.7.40',   phase: 2 },
      { id: 'nas',   name: 'NAS · ARCHIVE',    type: 'data',   x: 0.82, y: 0.74, ip: '10.42.7.50',   phase: 3 },
      { id: 'pc',    name: 'STUDY WORKSTATION',type: 'data',   x: 0.26, y: 0.80, ip: '10.42.7.66',   phase: 3 }
    ],
    edges: [
      ['wan', 'fw'], ['fw', 'sw'], ['sw', 'ap'], ['sw', 'alarm'], ['sw', 'bms'],
      ['sw', 'pc'], ['ap', 'nvr'], ['nvr', 'cams'], ['alarm', 'door'], ['bms', 'nas']
    ]
  };

  /* ---------------- BUILDING SYSTEMS ---------------- */
  const SYSTEMS = [
    { id: 'sys-main',  name: 'MAIN SERVICE',      group: 'POWER',  state: 'ONLINE',  safe: false },
    { id: 'sys-flood', name: 'PERIMETER FLOODS',  group: 'POWER',  state: 'ONLINE',  safe: true },
    { id: 'sys-ups',   name: 'UPS · HEAD-END',    group: 'POWER',  state: 'ONLINE',  safe: false },
    { id: 'sys-z1',    name: 'ZONE 1 · GROUND N', group: 'ALARM',  state: 'ARMED',   safe: true },
    { id: 'sys-z2',    name: 'ZONE 2 · SERVICE',  group: 'ALARM',  state: 'ARMED',   safe: true },
    { id: 'sys-z3',    name: 'ZONE 3 · GALLERY',  group: 'ALARM',  state: 'ARMED',   safe: true },
    { id: 'sys-z4',    name: 'ZONE 4 · UPPER',    group: 'ALARM',  state: 'ARMED',   safe: true },
    { id: 'sys-z5',    name: 'ZONE 5 · CELLAR',   group: 'ALARM',  state: 'ARMED',   safe: true },
    { id: 'sys-z6',    name: 'ZONE 6 · VAULT',    group: 'ALARM',  state: 'ARMED',   safe: false },
    { id: 'd-l1-svc',  name: 'SERVICE DOOR',      group: 'ACCESS', state: 'LOCKED',  safe: true },
    { id: 'd-l1-main', name: 'MAIN ENTRANCE',     group: 'ACCESS', state: 'LOCKED',  safe: true },
    { id: 'd-b1-sec',  name: 'SECURITY ROOM',     group: 'ACCESS', state: 'LOCKED',  safe: true },
    { id: 'd-b1-vault',name: 'VAULT MAG-LOCK',    group: 'ACCESS', state: 'LOCKED',  safe: false },
    { id: 'sys-hvac',  name: 'AHU-1 · SUPPLY',    group: 'CLIMATE',state: 'AUTO',    safe: true },
    { id: 'sys-vault-c',name:'VAULT CLIMATE',     group: 'CLIMATE',state: 'AUTO',    safe: true },
    { id: 'sys-siren', name: 'EXTERNAL SIREN',    group: 'ALARM',  state: 'ARMED',   safe: false }
  ];

  /* ---------------- COMMS CHATTER ---------------- */
  const CHATTER = [
    { ch: 'ESTATE-1', who: 'GUARD 2',   txt: 'North lawn clear. Heading in for the hourly.' },
    { ch: 'ESTATE-1', who: 'GUARD 1',   txt: 'Copy. Gate stays closed till the car comes back.' },
    { ch: 'VAN',      who: FICTION.partner, txt: 'I am at the service door. Tell me when.' },
    { ch: 'VAN',      who: FICTION.handle,  txt: 'Ninety seconds. Camera five is still hot.' },
    { ch: 'ESTATE-1', who: 'GUARD 2',   txt: 'Basement door reading open on the panel. Probably the damp again.' },
    { ch: 'VAN',      who: FICTION.handle,  txt: 'That was me. Do not move.' },
    { ch: 'MOBILE',   who: 'UNKNOWN',   txt: 'Truck is booked for 06:00. Everything goes out the same night.' },
    { ch: 'ESTATE-1', who: 'GUARD 1',   txt: 'Who authorised the cellar lights?' },
    { ch: 'VAN',      who: FICTION.partner, txt: 'I have eyes on the crates. HC-0114 is here.' },
    { ch: 'VAN',      who: FICTION.handle,  txt: 'Photograph the lot numbers. That is the whole case.' },
    { ch: 'MOBILE',   who: 'UNKNOWN',   txt: 'If anyone asks, the container never left the bond.' },
    { ch: 'ESTATE-1', who: 'GUARD 2',   txt: 'Panel just dropped zone six. Resetting.' },
    { ch: 'VAN',      who: FICTION.handle,  txt: 'Two minutes and I put the cameras back. Go now.' }
  ];

  /* ---------------- AMBIENT LOG LINES ---------------- */
  /* Tokens: %d big number · %n 0-99 · %c camera channel 1-16 · %z zone 1-6 · %s mac tail */
  const LOGS = [
    'kern: nf_conntrack: table full, dropping packet',
    'sshd[%d]: Accepted publickey for svc_backup from ' + FICTION.subnet + '.%n',
    'argus-panel: zone %z supervisory OK',
    'nvr: stream ch%c keyframe interval drift %n ms',
    'bms: AHU-1 supply temp 19.%n C setpoint 19.0 C',
    'dhcpd: DHCPACK on ' + FICTION.subnet + '.%n to 9c:8e:%s',
    'httpd: GET /cgi-bin/manifest.cgi?bol=MFB-2291-0447 200',
    'argus-panel: door contact %s -> OPEN',
    'nvr: ch%c motion event, %n objects',
    'ntpd: adjusting local clock by %n ms',
    'kernel: usb 1-1: new high-speed device',
    'meridian-edi: ANSI X12 310 received, %n segments',
    'meridian-edi: seal mismatch flagged, suppressed by rule 44',
    'audit: user=svc_customs cmd=/usr/bin/psql db=manifests',
    'sshd[%d]: Connection closed by ' + FICTION.subnet + '.%n port %d',
    'argus-panel: zone %z restored after walk test',
    'nvr: disk 61.%n%% used, oldest segment 31 d'
  ];

  global.VANDATA = { FICTION, FLOORS, ROUTE, CAMERAS, MANIFEST, NETWORK, SYSTEMS, CHATTER, LOGS };
})(window);
