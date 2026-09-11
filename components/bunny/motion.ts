// One closed contour: both leg roots stay attached to the original body.
export const bunnyBody = "M105 694 C50 539 263 320 441 310 C510 301 544 321 564 310 L580 271 C597 181 701 151 812 196 C913 243 949 331 933 397 C922 443 891 466 851 489 C958 539 977 589 947 620 C919 650 873 654 817 652 C856 715 835 761 780 775 C673 804 575 773 492 729 C448 700 419 706 388 736 C340 785 347 864 397 884 L329 970 L104 970 L104 861 C216 852 219 705 105 694Z";

// Progress, foreleg bend, hindleg bend, foreleg reach, hindleg reach.
// B's existing apex is at 48%; front contact precedes hind contact at 57–61%.
const poses = [
  [0, 0, 0, 1, 1], [30, 0, 0, 1, 1],
  [36, 10, -10, .94, .88], [41, 24, 24, .9, 1.06],
  [48, 38, -30, .8, .66], [54, 8, -24, .97, .75],
  [57, -16, -12, 1.08, .87], [61, 12, 8, .88, .92],
  [66, -2, -2, 1.01, 1.01], [70, 0, 0, 1, 1], [100, 0, 0, 1, 1],
];

export function bodyAtTime(time: number) {
  const progress = Math.max(0, Math.min(100, time / 60));
  if (progress <= 30 || progress >= 70) return bunnyBody;
  const next = poses.findIndex(pose => pose[0] >= progress);
  const a = poses[next - 1], b = poses[next];
  const t = (progress - a[0]) / (b[0] - a[0]);
  const eased = t * t * (3 - 2 * t);
  const pose = a.map((value, i) => value + (b[i] - value) * eased);

  function bend(x: number, y: number, weight: number, front: boolean) {
    const px = front ? 790 : 245, py = front ? 655 : 810;
    const angle = pose[front ? 1 : 2] * Math.PI / 180;
    const reach = pose[front ? 3 : 4];
    const dx = x - px, dy = y - py;
    const nx = px + (dx * Math.cos(angle) - dy * Math.sin(angle)) * reach;
    const ny = py + (dx * Math.sin(angle) + dy * Math.cos(angle)) * reach;
    return `${(x + (nx - x) * weight).toFixed(2)} ${(y + (ny - y) * weight).toFixed(2)}`;
  }

  // The shoulder, belly and hip endpoints are shared with the torso, not cut out.
  const f = (x: number, y: number, weight = 1) => bend(x, y, weight, true);
  const h = (x: number, y: number, weight = 1) => bend(x, y, weight, false);
  return "M105 694 C50 539 263 320 441 310 C510 301 544 321 564 310 L580 271 C597 181 701 151 812 196 C913 243 949 331 933 397 C922 443 891 466 851 489 C958 539 977 589 947 620 C919 650 873 654 817 652 " +
    `C${f(856, 715, .65)} ${f(835, 761)} ${f(780, 775)} ` +
    `C${f(673, 804, .8)} ${f(575, 773, .35)} 492 729 ` +
    `C448 700 419 706 388 736 C340 785 ${h(347, 864, .5)} ${h(397, 884, .75)} ` +
    `L${h(329, 970)} L${h(104, 970)} L104 861 C216 852 219 705 105 694Z`;
}
