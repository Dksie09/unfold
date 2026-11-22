// Everything the invite says. Change names, dates and places here; the drawings read from it.

export type WeddingEvent = {
  key: string; // also the room's name in the book
  name: string; // shown on the invite card
  tagline: string;
  start: string; // local date-time, ISO without zone
  end: string;
  venue: string;
  address: string;
  dress: string;
};

export const WEDDING = {
  couple: ["aarav", "meera"] as const,
  initials: "a & m",
  city: "jaipur",
  hosts: "together with their families",
  rsvpBy: "15 jan 2027",
  events: [
    {
      key: "roka",
      name: "the roka",
      tagline: "where it all becomes official",
      start: "2027-02-07T18:00",
      end: "2027-02-07T22:00",
      venue: "the sharma home",
      address: "14 civil lines, jaipur",
      dress: "pastels",
    },
    {
      key: "haldi",
      name: "haldi",
      tagline: "come get a little yellow",
      start: "2027-02-11T10:00",
      end: "2027-02-11T13:00",
      venue: "the courtyard, neem haveli",
      address: "neem haveli, amer road, jaipur",
      dress: "yellow, and clothes you don't mind ruining",
    },
    {
      key: "mehendi",
      name: "mehendi",
      tagline: "henna, chai and long afternoons",
      start: "2027-02-11T16:00",
      end: "2027-02-11T20:00",
      venue: "the garden, neem haveli",
      address: "neem haveli, amer road, jaipur",
      dress: "greens and florals",
    },
    {
      key: "sangeet",
      name: "sangeet",
      tagline: "the dance floor is calling",
      start: "2027-02-12T19:00",
      end: "2027-02-12T23:59",
      venue: "the lawns, neem haveli",
      address: "neem haveli, amer road, jaipur",
      dress: "glitter, sequins, dancing shoes",
    },
    {
      key: "wedding",
      name: "the wedding",
      tagline: "seven steps, one forever",
      start: "2027-02-13T19:00",
      end: "2027-02-13T23:00",
      venue: "the mandap, neem haveli",
      address: "neem haveli, amer road, jaipur",
      dress: "traditional, reds and golds welcome",
    },
    {
      key: "reception",
      name: "reception",
      tagline: "dinner, cake and one last dance",
      start: "2027-02-14T20:00",
      end: "2027-02-14T23:59",
      venue: "the grand hall, rambagh",
      address: "rambagh, bhawani singh road, jaipur",
      dress: "black tie, ivory and champagne",
    },
  ] satisfies WeddingEvent[],
};

export const eventByKey = (key: string) => WEDDING.events.find((e) => e.key === key);

const d = (iso: string) => new Date(iso);
export const fmtDay = (iso: string) => d(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toLowerCase().replace(",", "");
export const fmtDate = (iso: string) => d(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toLowerCase().replace(",", "");
export const fmtTime = (iso: string) => d(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

/** A guest's name from the link (?to=the%20sharma%20family), shown on the cover. */
let guest = "";
export const setGuest = (g: string) => {
  guest = g.trim().toLowerCase().slice(0, 40);
};
export const getGuest = () => guest;

/** An .ics calendar file for one event. */
export function icsFor(ev: WeddingEvent) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "") + "00";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//unfold//wedding invite//EN",
    "BEGIN:VEVENT",
    `UID:${ev.key}-${WEDDING.couple.join("-")}@unfold`,
    `DTSTART:${stamp(ev.start)}`,
    `DTEND:${stamp(ev.end)}`,
    `SUMMARY:${ev.name} · ${WEDDING.couple.join(" & ")}`,
    `LOCATION:${ev.venue}, ${ev.address}`,
    `DESCRIPTION:dress code: ${ev.dress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
